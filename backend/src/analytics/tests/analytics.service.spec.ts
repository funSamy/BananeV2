import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    productionData: {
      aggregate: jest.fn(),
    },
    expenditure: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getOverview', () => {
    it('should return analytics overview', async () => {
      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      mockPrismaService.productionData.aggregate.mockResolvedValue({
        _sum: { produced: 1000, sales: 800, stock: 200 },
        _avg: { stock: 150 },
      });

      mockPrismaService.expenditure.aggregate.mockResolvedValue({
        _sum: { amount: 500 },
      });

      const result = await service.getOverview(query);

      expect(result).toEqual({
        totalProduced: 1000,
        totalSales: 800,
        totalExpenses: 500,
        avgStock: 150,
        revenue: 300, // sales - expenses
      });
    });
  });

  describe('getMonthlyTrends', () => {
    it('should return monthly trends', async () => {
      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const mockTrends = [
        {
          month: '2024-01',
          produced: 1000,
          sales: 800,
          stock: 200,
          expenses: 500,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockTrends);

      const result = await service.getMonthlyTrends(query);

      expect(result).toEqual(mockTrends);
    });
  });

  describe('getExpenditureBreakdown', () => {
    it('should return expenditure breakdown', async () => {
      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        limit: 4,
      };

      mockPrismaService.expenditure.groupBy.mockResolvedValue([
        { name: 'Expense 1', _sum: { amount: 300 } },
        { name: 'Expense 2', _sum: { amount: 200 } },
      ]);

      const result = await service.getExpenditureBreakdown(query);

      expect(result).toEqual([
        { name: 'Expense 1', value: 300, percentage: 60 },
        { name: 'Expense 2', value: 200, percentage: 40 },
      ]);
    });
  });
});
