import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { TrainerService } from './trainer.service';
import {
  UpdateAvailabilityDto,
  CreateTrainingRequestDto,
  InviteTrainerDto,
  RespondInvitationDto,
} from './dto/trainer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Trainer Matching & Scheduling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trainer')
export class TrainerController {
  constructor(private trainerService: TrainerService) {}

  @Get('availability')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'TRAINER: Get current weekly availability and booked sessions' })
  async getAvailability(@CurrentUser() user: any) {
    return this.trainerService.getAvailability(user.sub);
  }

  @Put('availability')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'TRAINER: Save recurring 7-day slot availability' })
  async updateAvailability(
    @CurrentUser() user: any,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.trainerService.updateAvailability(user.sub, dto);
  }

  @Post('matching/suggest')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Algorithmic ranking of trainers for a proposed session' })
  async matchTrainers(@Body() dto: CreateTrainingRequestDto) {
    return this.trainerService.matchTrainers(dto);
  }

  @Post('sessions/invite')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Send session invitation to selected trainer' })
  async inviteTrainer(
    @CurrentUser() user: any,
    @Body() dto: InviteTrainerDto,
  ) {
    return this.trainerService.inviteTrainer(user.sub, dto);
  }

  @Get('invitations')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'TRAINER: Get incoming session invitations' })
  async getInvitations(@CurrentUser() user: any) {
    return this.trainerService.getTrainerInvitations(user.sub);
  }

  @Put('invitations/:id/respond')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'TRAINER: Accept or decline session invitation' })
  async respondInvitation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RespondInvitationDto,
  ) {
    return this.trainerService.respondInvitation(user.sub, id, dto);
  }

  @Get('calendar/export.ics')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'TRAINER: Export accepted training sessions as iCalendar (.ics)' })
  async exportICal(
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const icsString = await this.trainerService.exportICalFeed(user.sub);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=imd-training-calendar.ics');
    res.send(icsString);
  }
}
