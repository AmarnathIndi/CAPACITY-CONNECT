import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiTestGenService } from './ai-test-gen.service';
import { GenerateTestQuestionsDto, UpdateDraftQuestionDto } from './dto/ai-test-gen.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('AI Test Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRAINER, UserRole.ADMIN)
@Controller('ai/test-gen')
export class AiTestGenController {
  constructor(private testGenService: AiTestGenService) {}

  @Post('generate')
  @ApiOperation({ summary: 'TRAINER/ADMIN: Synthesize 8-10 draft MCQs from training PDF or lecture transcript' })
  async generateQuestions(@Body() dto: GenerateTestQuestionsDto) {
    return this.testGenService.generateQuestions(dto);
  }

  @Get('drafts')
  @ApiOperation({ summary: 'TRAINER/ADMIN: List drafted questions awaiting review' })
  async getDrafts(@Query('courseId') courseId?: string) {
    return this.testGenService.getDrafts(courseId);
  }

  @Put('drafts/:id')
  @ApiOperation({ summary: 'TRAINER/ADMIN: Edit, approve, or reject draft question' })
  async updateDraft(
    @Param('id') id: string,
    @Body() dto: UpdateDraftQuestionDto,
  ) {
    return this.testGenService.updateDraft(id, dto);
  }

  @Post('publish')
  @ApiOperation({ summary: 'TRAINER/ADMIN: Publish approved questions into exam paper' })
  async publishApproved(
    @Body() body: { testId: string; draftIds: string[] },
  ) {
    return this.testGenService.publishApprovedToTest(body.testId, body.draftIds || []);
  }
}
