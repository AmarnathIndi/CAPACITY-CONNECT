import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'crs-009' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Advanced NWP Ensemble Modeling' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'उन्नत एनडब्ल्यूपी एन्सेम्बल मॉडलिंग' })
  @IsOptional()
  @IsString()
  titleHi?: string;

  @ApiProperty({ example: 'Comprehensive guide to ensemble weather prediction.' })
  @IsNotEmpty()
  @IsString()
  descriptionEn: string;

  @ApiPropertyOptional({ example: 'एन्सेम्बल मौसम पूर्वानुमान के लिए व्यापक मार्गदर्शिका।' })
  @IsOptional()
  @IsString()
  descriptionHi?: string;

  @ApiProperty({ example: 'Numerical Weather Prediction' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ enum: CourseLevel, example: CourseLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?w=800' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  prerequisites?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  modules?: any[];
}

export class CreateRatingDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Outstanding operational depth and clear radar interpretations.' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UploadLibraryItemDto {
  @ApiProperty({ example: 'lib-010' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Doppler Velocity De-aliasing Algorithms' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'डॉप्लर वेग डी-अलियासिंग एल्गोरिदम' })
  @IsOptional()
  @IsString()
  titleHi?: string;

  @ApiProperty({ example: 'Radar Meteorology' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 'PDF' })
  @IsNotEmpty()
  @IsString()
  format: string;

  @ApiProperty({ example: '4.8 MB' })
  @IsNotEmpty()
  @IsString()
  fileSize: string;
}
