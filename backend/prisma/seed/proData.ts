import { PrismaClient } from '@prisma/client';
import { CreateProductionDto } from 'src/production/dto/create-production.dto';
import { ExpenditureDto } from 'src/production/dto/expenditure.dto';

export class ProdSeedData {
  constructor(private readonly prisma: PrismaClient) {}

  private static genRandomNumber(start?: number, end?: number): number {
    if (start !== undefined && end !== undefined) {
      return start + Math.floor(Math.random() * (end - start));
    } else if (start !== undefined) {
      return start + Math.random() * Number.MAX_SAFE_INTEGER;
    } else if (end !== undefined) {
      return Math.random() * Number.MIN_SAFE_INTEGER + end;
    }
    return 0;
  }
  private static genRandomAmount(start?: number, end?: number) {
    const num = this.genRandomNumber(start, end);
    return Math.max(start ?? 0, num - (num % 100));
  }

  static getProductionData(count = 1_000): CreateProductionDto[] {
    const data = Array(count)
      .fill(null)
      .map<CreateProductionDto>((_, index) => {
        const produced = this.genRandomAmount(1000, 12_000);
        const purchased = this.genRandomAmount(500, 20_000);
        const sales = this.genRandomAmount(0, produced);
        const dateMillis = new Date().valueOf();
        const sub = index * 24 * 3_600 * 1000;
        const numOfExpenditures = this.genRandomNumber(0, 5);
        const expenditures = Array(numOfExpenditures)
          .fill(null)
          .map<ExpenditureDto>((_, idx) => ({
            name: `Expenditure ${idx + 1}`,
            amount: this.genRandomAmount(0, 0.4 * sales),
          }))
          .filter((exp) => exp.amount > 0);
        return {
          date: new Date(dateMillis - sub),
          produced,
          purchased,
          sales,
          ...(expenditures.length > 0 && { expenditures }),
        };
      });
    return data;
  }

  async create(count?: number) {
    try {
      const promises = Array.from(ProdSeedData.getProductionData(count)).map(
        async (entry) => {
          const { expenditures, ...productionData } = entry;

          // Check if record with the same date exists
          const existingData = await this.prisma.productionData.findUnique({
            where: {
              date: productionData.date,
            },
          });

          if (existingData) return;

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
          await this.prisma.productionData.create({
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
        },
      );
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  }
}
