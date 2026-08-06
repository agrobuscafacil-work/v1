import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  online?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoReply?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  autoReplyMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  welcomeMessage?: string;
}
