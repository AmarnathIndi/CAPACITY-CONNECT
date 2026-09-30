import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from './database/prisma.service';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TestsModule } from './modules/tests/tests.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { SkillsModule } from './modules/skills/skills.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { AiTestGenModule } from './modules/ai-test-gen/ai-test-gen.module';
import { LearningPathsModule } from './modules/learning-paths/learning-paths.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { TrainerModule } from './modules/trainer/trainer.module';
import { LiveSessionsModule } from './modules/live-sessions/live-sessions.module';
import { OfflineSyncModule } from './modules/offline-sync/offline-sync.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';

// Guards & Interceptors
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    TestsModule,
    CertificatesModule,
    SkillsModule,
    AiAssistantModule,
    AiTestGenModule,
    LearningPathsModule,
    GamificationModule,
    TrainerModule,
    LiveSessionsModule,
    OfflineSyncModule,
    NotificationsModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
