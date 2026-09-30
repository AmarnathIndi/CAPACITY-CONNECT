import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitTestAttemptDto {
  @ApiProperty({
    example: [
      { questionId: 'q-001', selectedOptionIndex: 1 },
      { questionId: 'q-002', selectedOptionIndex: 0 },
    ],
  })
  @IsArray()
  answers: { questionId: string; selectedOptionIndex: number }[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isOffline?: boolean;

  @ApiPropertyOptional({ example: 'hmac-signature-string' })
  @IsOptional()
  @IsString()
  clientSignature?: string;

  @ApiPropertyOptional({ example: '2026-09-30T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  offlineCompletedAt?: string;
}

export class CreateTestPaperDto {
  @ApiProperty({ example: 'tst-009' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'crs-001' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'Advanced Doppler Radar Interpretation Exam' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'उन्नत डॉप्लर रडार व्याख्या परीक्षा' })
  @IsOptional()
  @IsString()
  titleHi?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  passingScore?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  questions?: any[];
}
