import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
