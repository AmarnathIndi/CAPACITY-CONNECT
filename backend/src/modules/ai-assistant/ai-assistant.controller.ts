import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { AssistantChatDto, AssistantFeedbackDto } from './dto/ai-assistant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Course Assistant (RAG)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/assistant')
export class AiAssistantController {
  constructor(private assistantService: AiAssistantService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Ask bilingual question to AI Assistant; returns answers citing official manuals/timestamps' })
  async chat(
    @CurrentUser() user: any,
    @Body() dto: AssistantChatDto,
  ) {
    return this.assistantService.answerQuestion(dto, user?.sub);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit thumbs up/down quality feedback for an answer' })
  async feedback(
    @CurrentUser() user: any,
    @Body() dto: AssistantFeedbackDto,
  ) {
    return this.assistantService.recordFeedback(dto, user?.sub);
  }
}
