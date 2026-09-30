import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TestsController],
  providers: [TestsService, PrismaService],
  exports: [TestsService],
})
export class TestsModule {}
