import { Module } from '@nestjs/common';
import { AiTestGenController } from './ai-test-gen.controller';
import { AiTestGenService } from './ai-test-gen.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AiTestGenController],
  providers: [AiTestGenService, PrismaService],
  exports: [AiTestGenService],
})
export class AiTestGenModule {}
