import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SystemConfigDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  value: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
