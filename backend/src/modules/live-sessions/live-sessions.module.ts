import { Module } from '@nestjs/common';
import { LiveSessionsController } from './live-sessions.controller';
import { LiveSessionsService } from './live-sessions.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [LiveSessionsController],
  providers: [LiveSessionsService, PrismaService],
  exports: [LiveSessionsService],
})
export class LiveSessionsModule {}
