import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, PrismaService],
  exports: [SkillsService],
})
export class SkillsModule {}
