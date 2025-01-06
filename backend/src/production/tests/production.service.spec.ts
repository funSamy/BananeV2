import { Test, TestingModule } from '@nestjs/testing';
import { ProductionService } from '../production.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductionDto } from '../dto/create-production.dto';
import { UpdateProductionDto } from '../dto/update-production.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductionService', () => {
  let service: ProductionService;
  let prisma: PrismaService;

  const mockPrismaService = {
    productionData: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateProductionDto = {
      date: new Date(),
      produced: 100,
      sales: 50,
      purchased: 20,
      expenditures: [{ name: 'Test Expense', amount: 500 }],
    };

    it('should create a production record with expenditures', async () => {
      const expectedResult = {
        id: 1,
        ...createDto,
        remains: 50, // produced - sales
        stock: 70, // purchase + produced - sales
        createdAt: new Date(),
        updatedAt: new Date(),
        expenditures: [{ id: 1, name: 'Test Expense', amount: 500 }],
      };

      mockPrismaService.productionData.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual({
        success: true,
        data: expectedResult,
        message: 'Production data created successfully',
      });

      expect(prisma.productionData.create).toHaveBeenCalledWith({
        data: {
          date: createDto.date,
          produced: createDto.produced,
          sales: createDto.sales,
          purchased: createDto.purchased,
          remains: 50,
          stock: 70,
          expenditures: {
            create: createDto.expenditures,
          },
        },
        include: {
          expenditures: true,
        },
      });
    });
  });

  describe('findAll', () => {
    const mockProductionData = [
      {
        id: 1,
        date: new Date(),
        produced: 100,
        sales: 50,
        expenditures: [],
      },
    ];

    it('should return paginated production data', async () => {
      mockPrismaService.productionData.findMany.mockResolvedValue(
        mockProductionData,
      );
      mockPrismaService.productionData.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual({
        success: true,
        data: {
          items: mockProductionData,
          pagination: {
            total: 1,
            pageCount: 1,
            currentPage: 1,
            pageSize: 10,
            from: 1,
            to: 1,
          },
        },
      });
    });

    it('should handle date range filters correctly', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await service.findAll({ startDate, endDate });

      expect(prisma.productionData.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: startDate,
            lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
        include: {
          expenditures: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a production record if found', async () => {
      const mockProduction = {
        id: 1,
        date: new Date(),
        produced: 100,
        expenditures: [],
      };

      mockPrismaService.productionData.findUnique.mockResolvedValue(
        mockProduction,
      );

      const result = await service.findOne(1);

      expect(result).toEqual({
        success: true,
        data: mockProduction,
      });
    });

    it('should throw NotFoundException if record not found', async () => {
      mockPrismaService.productionData.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: Partial<UpdateProductionDto> = {
      produced: 150,
      expenditures: [
        { id: 1, name: 'Updated Expense', amount: 600 },
        { name: 'New Expense', amount: 300 },
      ],
    };

    it('should update production and handle expenditures correctly', async () => {
      const existingProduction = {
        id: 1,
        produced: 100,
        sales: 50,
        purchased: 20,
        expenditures: [{ id: 1, name: 'Old Expense', amount: 500 }],
      };

      mockPrismaService.productionData.findUnique.mockResolvedValue(
        existingProduction,
      );
      mockPrismaService.productionData.update.mockResolvedValue({
        ...existingProduction,
        ...updateDto,
      });

      await service.update(1, updateDto);

      expect(prisma.productionData.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            expenditures: {
              deleteMany: {
                id: { notIn: [1] },
              },
              upsert: expect.any(Array),
            },
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a production record', async () => {
      const mockProduction = {
        id: 1,
        date: new Date(),
        expenditures: [],
      };

      mockPrismaService.productionData.findUnique.mockResolvedValue(
        mockProduction,
      );

      const result = await service.remove(1);

      expect(result).toEqual({
        success: true,
        message: 'Production data deleted successfully',
      });
      expect(prisma.productionData.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
