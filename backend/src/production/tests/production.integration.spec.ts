import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductionDto } from '../dto/create-production.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('Production (Integration)', () => {
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
        exceptionFactory: (errors) => {
          return new BadRequestException({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: errors,
            },
          });
        },
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    // Clean the database before each test
    await prisma.expenditure.deleteMany();
    await prisma.productionData.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/production/data (POST)', () => {
    it('should create production data', async () => {
      const createDto: CreateProductionDto = {
        date: new Date(),
        produced: 100,
        sales: 50,
        purchased: 20,
        expenditures: [{ name: 'Test Expense', amount: 500 }],
      };

      const response = await request(app.getHttpServer())
        .post('/production/data')
        .send(createDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        produced: createDto.produced,
        sales: createDto.sales,
        purchased: createDto.purchased,
        remains: 50,
        stock: 70,
      });
      expect(response.body.data.expenditures).toHaveLength(1);
    });

    it('should validate input data', async () => {
      const invalidDto = {
        date: 'invalid-date',
        produced: -100,
      };

      const response = await request(app.getHttpServer())
        .post('/production/data')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toMatchObject({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array),
        },
      });
    });
  });

  describe('/production/data (GET)', () => {
    let testDate: Date;

    beforeEach(async () => {
      // Create a fixed date for testing
      testDate = new Date();
      testDate.setHours(0, 0, 0, 0); // Set to start of day

      // Seed test data
      await prisma.productionData.create({
        data: {
          date: testDate,
          produced: 100,
          sales: 50,
          purchased: 20,
          remains: 50,
          stock: 70,
          expenditures: {
            create: [{ name: 'Test Expense', amount: 500 }],
          },
        },
      });
    });

    it('should filter by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/production/data')
        .query({
          startDate: testDate.toISOString().slice(0, 19),
          endDate: testDate.toISOString().slice(0, 19),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
    });

    it('should return paginated production data', async () => {
      const response = await request(app.getHttpServer())
        .get('/production/data')
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });
  });
});
