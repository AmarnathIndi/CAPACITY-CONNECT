import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Notifications & Announcements')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user notifications and unread count' })
  async getMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('read-all')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  async markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Public()
  @Get('announcements')
  @ApiOperation({ summary: 'Get official departmental announcements & news circulars' })
  async getAnnouncements() {
    return this.notificationsService.getAnnouncements();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('announcements')
  @ApiOperation({ summary: 'ADMIN: Publish new announcement or circular to portal homepage' })
  async createAnnouncement(@Body() body: any) {
    return this.notificationsService.createAnnouncement(body);
  }
}
