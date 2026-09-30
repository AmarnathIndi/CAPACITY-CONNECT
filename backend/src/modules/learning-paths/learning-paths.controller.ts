import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LearningPathsService } from './learning-paths.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Personalized Learning Paths')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private pathsService: LearningPathsService) {}

  @Get('my-path')
  @ApiOperation({ summary: 'Get personalized step-by-step learning path with locked/unlocked stages' })
  async getMyPath(@CurrentUser() user: any) {
    return this.pathsService.getUserLearningPath(user.sub);
  }
}
