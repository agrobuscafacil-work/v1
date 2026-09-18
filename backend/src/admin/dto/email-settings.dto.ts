import { IsEmail, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmailSettingsDto {
  @ApiPropertyOptional({ example: 'smtp.gmail.com' })
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @ApiPropertyOptional({ example: 587 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort?: number;

  @ApiPropertyOptional({ example: 'contato@agrobuscafacil.com.br' })
  @IsOptional()
  @IsString()
  smtpUser?: string;

  @ApiPropertyOptional({ description: 'Senha SMTP (somente escrita, nunca retornada)' })
  @IsOptional()
  @IsString()
  smtpPass?: string;

  @ApiPropertyOptional({ example: 'noreply@agrobuscafacil.com.br' })
  @IsOptional()
  @IsString()
  smtpFrom?: string;

  @ApiPropertyOptional({ enum: ['tls', 'ssl'], description: 'tls = porta 587, ssl = porta 465' })
  @IsOptional()
  @IsIn(['tls', 'ssl'])
  smtpSecure?: 'tls' | 'ssl';
}

export class TestEmailDto {
  @ApiProperty({ example: 'admin@agrobuscafacil.com.br' })
  @IsEmail()
  to: string;
}
