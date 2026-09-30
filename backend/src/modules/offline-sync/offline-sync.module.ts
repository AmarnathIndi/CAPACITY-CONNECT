import { Module } from '@nestjs/common';
import { OfflineSyncController } from './offline-sync.controller';
import { OfflineSyncService } from './offline-sync.service';
import { PrismaService } from '../../database/prisma.service';
import { TestsModule } from '../tests/tests.module';

@Module({
  imports: [TestsModule],
  controllers: [OfflineSyncController],
  providers: [OfflineSyncService, PrismaService],
  exports: [OfflineSyncService],
})
export class OfflineSyncModule {}
