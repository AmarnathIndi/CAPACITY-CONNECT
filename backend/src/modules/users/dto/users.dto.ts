import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Dr. Aarav Sharma' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Scientist-D' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: '+91 98110 12345' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'hi' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ example: [{ degree: 'Ph.D. Atmospheric Sciences', institution: 'IIT Delhi', year: 2018 }] })
  @IsOptional()
  @IsArray()
  qualifications?: any[];

  @ApiPropertyOptional({ example: [{ role: 'Radar Officer', organisation: 'IMD Chennai', duration: '2019-2023' }] })
  @IsOptional()
  @IsArray()
  experience?: any[];

  @ApiPropertyOptional({ example: ['Mesoscale Modeling', 'Doppler Radar'] })
  @IsOptional()
  @IsArray()
  interests?: string[];

  @ApiPropertyOptional({ example: [{ name: 'Doppler Radar Operations', level: 'Expert' }] })
  @IsOptional()
  @IsArray()
  skills?: any[];
}

export class ApproveUserDto {
  @ApiProperty({ enum: UserRole, example: UserRole.TRAINEE })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Delhi HQ' })
  @IsOptional()
  @IsString()
  office?: string;
}

export class RejectUserDto {
  @ApiProperty({ example: 'Official email domain verification failed.' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class BulkImportRowDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsString()
  office: string;

  @IsOptional()
  @IsString()
  designation?: string;
}

export class BulkImportConfirmDto {
  @IsArray()
  users: BulkImportRowDto[];
}
