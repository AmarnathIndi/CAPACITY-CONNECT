import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gamification & Leaderboard')
@Controller('gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-progress')
  @ApiOperation({ summary: 'Get officer total points, badges, streak, and learning hours' })
  async getMyProgress(@CurrentUser() user: any) {
    return this.gamificationService.getMyProgress(user.sub);
  }

  @Public()
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get regional office leaderboard and top meteorological learners' })
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @Public()
  @Get('achievements-wall')
  @ApiOperation({ summary: 'Get live Achievements Wall feed for the portal homepage' })
  async getAchievementsWall() {
    return this.gamificationService.getAchievementsWall();
  }
}
