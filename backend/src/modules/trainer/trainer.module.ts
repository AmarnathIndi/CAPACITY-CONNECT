import { Module } from '@nestjs/common';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TrainerController],
  providers: [TrainerService, PrismaService],
  exports: [TrainerService],
})
export class TrainerModule {}
