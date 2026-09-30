import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LiveSessionsService } from './live-sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Live Virtual Classes (Jitsi)')
@Controller('live-sessions')
export class LiveSessionsController {
  constructor(private sessionsService: LiveSessionsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List live webinars and scheduled briefing sessions' })
  async getSessions(@Query('courseId') courseId?: string) {
    return this.sessionsService.getSessions(courseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/token')
  @ApiOperation({ summary: 'Generate secure Jitsi Meet JWT token (trainer=moderator, trainee=participant)' })
  async getJoinToken(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.generateJitsiToken(id, user);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook endpoint for Jitsi Meet attendance and recording events' })
  async webhook(@Body() event: any) {
    return this.sessionsService.handleJitsiWebhook(event);
  }
}
