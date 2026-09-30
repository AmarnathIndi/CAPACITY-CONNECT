import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OfflineSyncService } from './offline-sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('PWA & Offline Synchronization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offline')
export class OfflineSyncController {
  constructor(private syncService: OfflineSyncService) {}

  @Get('package/:testId')
  @ApiOperation({ summary: 'Download HMAC-signed test package for offline client execution' })
  async getPackage(
    @Param('testId') testId: string,
    @CurrentUser() user: any,
  ) {
    return this.syncService.generateOfflinePackage(testId, user.sub);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize queue of offline-taken tests upon network reconnection' })
  async syncSubmissions(
    @CurrentUser() user: any,
    @Body('submissions') submissions: any[],
  ) {
    return this.syncService.syncOfflineSubmissions(user.sub, submissions || []);
  }
}
