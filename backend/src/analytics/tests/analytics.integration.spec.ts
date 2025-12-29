import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('Analytics (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock JWT guard to allow requests
  const mockJwtGuard = { canActivate: () => true };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = await moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.expenditure.deleteMany();
    await prisma.productionData.deleteMany();

    // Seed test data
    const testDate = new Date();
    await prisma.productionData.create({
      data: {
        date: testDate,
        produced: 100,
        sales: 50,
        stock: 50,
        expenditures: {
          create: [
            { name: 'Expense 1', amount: 300 },
            { name: 'Expense 2', amount: 200 },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/analytics/overview (GET)', () => {
    it('should return analytics overview', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/overview')
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        totalProduced: expect.any(Number),
        totalSales: expect.any(Number),
        totalExpenses: expect.any(Number),
        avgStock: expect.any(Number),
        revenue: expect.any(Number),
      });
    });
  });

  describe('/analytics/monthly-trends (GET)', () => {
    it('should return monthly trends', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/monthly-trends')
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toMatchObject({
        month: expect.any(String),
        produced: expect.any(Number),
        sales: expect.any(Number),
        stock: expect.any(Number),
        expenses: expect.any(Number),
      });
    });
  });

  describe('/analytics/expenditure-breakdown (GET)', () => {
    it('should return expenditure breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/expenditure-breakdown')
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          limit: 4,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toMatchObject({
        name: expect.any(String),
        value: expect.any(Number),
        percentage: expect.any(Number),
      });
    });
  });
});
