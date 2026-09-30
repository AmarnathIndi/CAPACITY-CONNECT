import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AiAssistantController],
  providers: [AiAssistantService, PrismaService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
