import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  VersioningType,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS (still needed for development/external access)
  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:3000',
      'http://localhost:1965',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Enable versioning with /api/v1 prefix
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
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

  // Apply response formatting
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Serve static files from frontend build
  const frontendPath = join(__dirname, '..', '..', 'frontend', 'dist');
  app.useStaticAssets(frontendPath, {
    index: false, // Disable automatic index serving to handle SPA routing
  });

  // Serve index.html for all non-API routes (SPA fallback)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(join(frontendPath, 'index.html'));
    } else {
      next();
    }
  });

  const port = process.env.PORT ?? 1965;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📦 Serving frontend from: ${frontendPath}`);
  console.log(`🔌 API endpoints available at: http://localhost:${port}/api/v1`);
}
bootstrap();
