import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '@prisma/client';

export class UpdateAvailabilityDto {
  @ApiProperty({
    example: [
      { dayOfWeek: 1, slot: 'Morning', isBlocked: false },
      { dayOfWeek: 2, slot: 'Afternoon', isBlocked: false },
    ],
  })
  @IsArray()
  slots: { dayOfWeek: number; slot: string; isBlocked: boolean }[];
}

export class CreateTrainingRequestDto {
  @ApiProperty({ example: 'Doppler Radar Operations & Velocity Interpretation' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({ example: '2026-10-15T09:30:00.000Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'Chennai RMC' })
  @IsOptional()
  @IsString()
  region?: string;
}

export class InviteTrainerDto {
  @ApiProperty({ example: 'usr-002' })
  @IsNotEmpty()
  @IsString()
  trainerId: string;

  @ApiProperty({ example: 'Doppler Radar Operations & Velocity Interpretation' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({ example: '2026-10-15T09:30:00.000Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'Chennai RMC' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsNumber()
  matchScore?: number;
}

export class RespondInvitationDto {
  @ApiProperty({ enum: SessionStatus, example: SessionStatus.ACCEPTED })
  @IsEnum(SessionStatus)
  status: SessionStatus;
}
