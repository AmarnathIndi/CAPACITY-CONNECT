import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssistantChatDto {
  @ApiProperty({ example: 'How does Doppler radar measure wind velocity?' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiPropertyOptional({ example: 'crs-001' })
  @IsOptional()
  @IsString()
  courseId?: string;
}

export class AssistantFeedbackDto {
  @ApiProperty({ example: 'How does Doppler radar measure wind velocity?' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  helpful: boolean;

  @ApiPropertyOptional({ example: 'Very clear citation to page 42' })
  @IsOptional()
  @IsString()
  comment?: string;
}
