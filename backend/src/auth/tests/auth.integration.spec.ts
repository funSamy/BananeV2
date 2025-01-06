import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should authenticate user and return token', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: password,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          token: expect.any(String),
          user: {
            id: user.id,
            email: user.email,
          },
        },
      });
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Invalid credentials',
        statusCode: 401,
      });
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should generate reset token', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: user.email,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
      });

      // Verify token was generated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.resetPasswordToken).toBeTruthy();
      expect(updatedUser.tokenExpiresAt).toBeTruthy();
    });
  });
});
