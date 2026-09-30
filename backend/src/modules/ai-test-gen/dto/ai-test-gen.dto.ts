import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionDifficulty, QuestionStatus } from '@prisma/client';

export class GenerateTestQuestionsDto {
  @ApiProperty({ example: 'crs-001' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ example: 'IMD_Doppler_Radar_Operational_Manual_2026.pdf' })
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  questionCount?: number;
}

export class UpdateDraftQuestionDto {
  @ApiPropertyOptional({ example: 'What frequency band does S-Band Doppler Radar utilize?' })
  @IsOptional()
  @IsString()
  questionEn?: string;

  @ApiPropertyOptional({ example: 'एस-बैंड डॉप्लर रडार किस आवृत्ति बैंड का उपयोग करता है?' })
  @IsOptional()
  @IsString()
  questionHi?: string;

  @ApiPropertyOptional({ example: ['1-2 GHz', '2-4 GHz', '4-8 GHz', '8-12 GHz'] })
  @IsOptional()
  @IsArray()
  optionsEn?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  correctIndex?: number;

  @ApiPropertyOptional({ enum: QuestionDifficulty })
  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @ApiPropertyOptional({ enum: QuestionStatus })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;
}
