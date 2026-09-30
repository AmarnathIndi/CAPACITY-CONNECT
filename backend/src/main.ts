import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('CapacityConnectBootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed by Nginx in prod, allow Swagger in dev
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cookie Parser for httpOnly JWT Tokens
  app.use(cookieParser());

  // CORS Configuration
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in prototype for multi-port testing
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CAPACITY CONNECT API — India Meteorological Department')
    .setDescription(
      'Air-gapped, self-hosted Training & Learning Management REST API for IMD officers, Ministry of Earth Sciences, Government of India.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'Officer login, registration approval, and 2FA')
    .addTag('Users & Profiles', 'Staff directories, qualifications, skills, and bulk import')
    .addTag('Courses & Materials', 'Curriculum, video streaming, synchronized transcripts, and library')
    .addTag('Examinations & Tests', 'Timed MCQ tests, server randomization, and auto-grading')
    .addTag('Certificates & Verification', 'Instant public QR code verification and PDF minting')
    .addTag('AI Course Assistant (RAG)', 'Air-gapped bilingual assistant citing IMD manuals & timestamps')
    .addTag('AI Test Generator', 'Automatic MCQ generation from uploaded PDFs with trainer review')
    .addTag('Skill Graph & Expert Finder', 'Natural language search for meteorological specialists')
    .addTag('Trainer Matching & Scheduling', 'Explainable matching algorithm and iCal calendar')
    .addTag('Gamification & Leaderboard', 'Points, badges, office leaderboard, and Achievements Wall')
    .addTag('Live Virtual Classes (Jitsi)', 'Jitsi Meet tokens, attendance tracking, and recordings')
    .addTag('PWA & Offline Synchronization', 'Cryptographic test packages and reconnection sync')
    .addTag('Notifications & Announcements', 'Circulars, alerts, and urgent warnings')
    .addTag('Admin Governance & Audit', 'Append-only immutable audit trail and Recharts dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'CAPACITY CONNECT API Documentation — IMD',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`✓ CAPACITY CONNECT REST API is running on: http://localhost:${port}/api/v1`);
  logger.log(`✓ Interactive OpenAPI/Swagger Docs available at: http://localhost:${port}/api/v1/docs`);
}

bootstrap();
