import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(query: AnalyticsQueryDto) {
    const { startDate, endDate } = query;

    const data = await this.prisma.productionData.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        produced: true,
        sales: true,
        stock: true,
      },
      _avg: {
        stock: true,
      },
    });

    // Get total expenses
    const expenses = await this.prisma.expenditure.aggregate({
      where: {
        productionData: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      totalProduced: data._sum.produced || 0,
      totalSales: data._sum.sales || 0,
      totalExpenses: expenses._sum.amount || 0,
      avgStock: Math.round(data._avg.stock || 0),
      revenue: (data._sum.sales || 0) - (expenses._sum.amount || 0),
    };
  }

  async getMonthlyTrends(query: AnalyticsQueryDto) {
    const { startDate, endDate } = query;

    const monthlyData = await this.prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(produced) as produced,
        SUM(sales) as sales,
        AVG(stock) as stock,
        (
          SELECT SUM(amount)
          FROM Expenditure e
          WHERE strftime('%Y-%m', e.createdAt) = strftime('%Y-%m', p.date)
        ) as expenses
      FROM ProductionData p
      WHERE date BETWEEN ${startDate} AND ${endDate}
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
    `;

    return monthlyData;
  }

  async getExpenditureBreakdown(query: AnalyticsQueryDto) {
    const { startDate, endDate, limit = 4 } = query;

    const expenditures = await this.prisma.expenditure.groupBy({
      by: ['name'],
      where: {
        productionData: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    const total = expenditures.reduce(
      (sum, exp) => sum + (exp._sum.amount || 0),
      0,
    );

    return expenditures.map((exp) => ({
      name: exp.name,
      value: exp._sum.amount || 0,
      percentage: total ? ((exp._sum.amount || 0) / total) * 100 : 0,
    }));
  }
}
