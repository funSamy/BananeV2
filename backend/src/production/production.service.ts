import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { ProductionQueryDto, SortOrder } from './dto/production-query.dto';
import { Prisma } from '@prisma/client';
import { UpdateProductionDto } from './dto/update-production.dto';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  async create(createProductionDto: CreateProductionDto) {
    const { expenditures, ...productionData } = createProductionDto;

    // Check if record with the same date exists
    const existingData = await this.prisma.productionData.findUnique({
      where: {
        date: productionData.date,
      },
    });

    if (existingData) {
      throw new ConflictException(`Data for ${productionData.date.toUTCString()} already exists`);
    }

    const stock = productionData.produced;
    const remains =
      stock - productionData.sales > 0 ? stock - productionData.sales : 0;
    const data = await this.prisma.productionData.create({
      data: {
        ...productionData,
        remains,
        stock,
        expenditures: {
          create: expenditures,
        },
      },
      include: {
        expenditures: true,
      },
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
      sortBy = 'date',
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
          [sortBy]: sortOrder.toLowerCase(),
        },
        include: {
          expenditures: true,
        },
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
      include: {
        expenditures: true,
      },
    });

    if (!production) {
      throw new NotFoundException(`Production data with ID ${id} not found`);
    }

    return {
      data: production,
    };
  }

  async update(id: number, updateData: Partial<UpdateProductionDto>) {
    const { expenditures, ...productionData } = updateData;

    // First check if record exists
    const existing = await this.findOne(id);

    // Calculate new values using existing data
    const newProduced = productionData.produced ?? existing.data.produced;
    const newSales = productionData.sales ?? existing.data.sales;
    const newPurchased = productionData.purchased ?? existing.data.purchased;

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
        remains: newProduced - newSales,
        stock: newPurchased + newProduced - newSales,
        expenditures: expendituresUpdate,
      },
      include: {
        expenditures: true,
      },
    });
  }

  async remove(id: number) {
    // First check if record exists
    await this.findOne(id);

    await this.prisma.productionData.delete({
      where: { id },
    });

    return {
      message: 'Production data deleted successfully',
    };
  }
}
