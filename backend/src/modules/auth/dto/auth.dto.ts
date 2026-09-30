import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'aarav.sharma@imd.gov.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'imd@123' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  totpCode?: string;
}

export class SignUpDto {
  @ApiProperty({ example: 'Anita Roy' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'anita.roy@imd.gov.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'imd@123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Delhi HQ' })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiPropertyOptional({ example: 'Meteorologist-I' })
  @IsOptional()
  @IsString()
  designation?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'aarav.sharma@imd.gov.in' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-uuid' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'newPassword@123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'imd@123' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'newPassword@123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class Verify2FaDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  totpCode: string;
}
