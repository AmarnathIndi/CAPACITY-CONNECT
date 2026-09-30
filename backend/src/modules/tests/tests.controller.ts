import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { SubmitTestAttemptDto, CreateTestPaperDto } from './dto/tests.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Examinations & Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get examination metadata, rules, passing score, and time limit' })
  async getTestMeta(@Param('id') id: string) {
    return this.testsService.getTestMeta(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start timed test attempt (returns server-randomized questions without answers)' })
  async startAttempt(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.testsService.startAttempt(id, user.sub);
  }

  @Post('attempts/:id/submit')
  @ApiOperation({ summary: 'Submit attempt answers, enforce server-side timer, auto-grade and issue cert' })
  async submitAttempt(
    @Param('id') attemptId: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitTestAttemptDto,
  ) {
    return this.testsService.submitAttempt(attemptId, user.sub, dto);
  }

  @Get('attempts/:id/result')
  @ApiOperation({ summary: 'Get attempt results, score, certificate hash, and question review' })
  async getAttemptResult(
    @Param('id') attemptId: string,
    @CurrentUser() user: any,
  ) {
    return this.testsService.getAttemptResult(attemptId, user.sub);
  }

  @Get(':id/results')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'TRAINER/ADMIN: Get roster of officers who completed the exam and their scores' })
  async getTestResultsForTrainer(@Param('id') id: string) {
    return this.testsService.getTestResultsForTrainer(id);
  }

  @Post()
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'TRAINER/ADMIN: Create manual examination paper with deadline' })
  async createTestPaper(@Body() dto: CreateTestPaperDto) {
    return this.testsService.createTestPaper(dto);
  }
}
