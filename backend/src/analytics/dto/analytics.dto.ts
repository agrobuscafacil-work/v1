import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pagePath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  browser?: string;
}

export class LogSearchDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  term: string;
}