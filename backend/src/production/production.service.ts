import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDto } from './dto/create-production.dto';
import {
  ProductionQueryDto,
  SortOrder,
  SortByField,
} from './dto/production-query.dto';
import { Prisma } from '../../prisma/generated/prisma/client';
import { UpdateProductionDto } from './dto/update-production.dto';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  private expenditureInclude: Prisma.ProductionDataInclude = {
    expenditures: {
      select: {
        name: true,
        amount: true,
      },
    },
  };

  async create(createProductionDto: CreateProductionDto) {
    const { expenditures, ...productionData } = createProductionDto;

    // Convert date string to Date object
    const dateObj = new Date(productionData.date);

    // Check if record with the same date exists
    const existingData = await this.prisma.productionData.findUnique({
      where: {
        date: dateObj.toISOString().split('T')[0],
      },
    });

    if (existingData) {
      throw new ConflictException(
        `Data for ${dateObj.toISOString()} already exists`,
      );
    }

    // Retrieve the last stored data to calculate stock and remains
    // If no previous data, assume stock starts at produced amount

    const last = await this.prisma.productionData.findFirst({
      orderBy: {
        date: 'desc',
      },
      select: {
        remains: true,
      },
    });

    const stock = productionData.produced + (last?.remains || 0);
    const remains =
      stock - productionData.sales > 0 ? stock - productionData.sales : 0;
    const data = await this.prisma.productionData.create({
      data: {
        ...productionData,
        date: dateObj,
        remains,
        stock,
        expenditures: {
          create: expenditures,
        },
      },
      include: this.expenditureInclude,
    });

    return {
      data,
      message: 'Production data created successfully',
    };
  }

  async findAll(query: ProductionQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = SortByField.DATE,
      sortOrder = SortOrder.DESC,
      startDate,
      endDate,
      ...filters
    } = query;

    // Handle date range conditions
    let dateFilter: Prisma.ProductionDataWhereInput['date'] = undefined;

    if (startDate && !endDate) {
      dateFilter = {
        gte: startDate,
      };
    } else if (!startDate && endDate) {
      dateFilter = {
        lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      };
    } else if (startDate && endDate) {
      dateFilter = {
        gte: startDate,
        lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      };
    }

    const where: Prisma.ProductionDataWhereInput = {
      ...(dateFilter ? { date: dateFilter } : {}),
      ...filters,
    };

    const [total, data] = await Promise.all([
      this.prisma.productionData.count({ where }),
      this.prisma.productionData.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder.valueOf().toLowerCase(),
        },
        include: this.expenditureInclude,
      }),
    ]);

    const pageCount = Math.ceil(total / pageSize);

    return {
      data: {
        items: data,
        pagination: {
          total,
          pageCount,
          currentPage: page,
          pageSize,
          from: (page - 1) * pageSize + 1,
          to: Math.min(page * pageSize, total),
        },
      },
    };
  }

  async findOne(id: number) {
    const production = await this.prisma.productionData.findUnique({
      where: { id },
      include: this.expenditureInclude,
    });

    if (!production) {
      throw new NotFoundException(`Production data with ID ${id} not found`);
    }

    return {
      data: production,
    };
  }

  async update(id: number, updateData: Partial<UpdateProductionDto>) {
    const { expenditures, date, ...productionData } = updateData;

    // First check if record exists
    const { data } = await this.findOne(id);

    // Convert date string to Date object if provided
    const dateObj = date ? new Date(date) : undefined;

    // Calculate new values using existing data
    const newProduced = productionData.produced ?? data.produced;
    const newSales = productionData.sales ?? data.sales;
    const newPurchased = productionData.purchased ?? data.purchased;

    // Handle expenditures update
    const expendituresUpdate = expenditures
      ? {
          // Delete expenditures that aren't in the new list
          deleteMany: {
            id: {
              notIn: expenditures.filter((e) => e.id).map((e) => e.id),
            },
          },
          // Update existing and create new ones
          upsert: expenditures.map((exp) => ({
            where: {
              id: exp.id || -1, // -1 for new expenditures
            },
            create: {
              name: exp.name,
              amount: exp.amount,
            },
            update: {
              name: exp.name,
              amount: exp.amount,
            },
          })),
        }
      : undefined;

    return this.prisma.productionData.update({
      where: { id },
      data: {
        ...productionData,
        ...(dateObj && { date: dateObj }),
        remains: newProduced - newSales,
        stock: newPurchased + newProduced - newSales,
        expenditures: expendituresUpdate,
      },
      include: this.expenditureInclude,
    });
  }

  async remove(id: number) {
    // First check if record exists
    await this.findOne(id);

    await this.prisma.productionData.delete({
      where: { id },
      include: this.expenditureInclude,
    });

    return {
      message: 'Production data deleted successfully',
    };
  }
}
