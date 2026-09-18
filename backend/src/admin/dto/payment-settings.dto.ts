import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentSettingsDto {
  @ApiPropertyOptional({ enum: ['stripe', 'mercadopago', 'mock'] })
  @IsOptional()
  @IsIn(['stripe', 'mercadopago', 'mock'])
  gateway?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  creditCardEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pixEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  boletoEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(21)
  maxInstallments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minInstallmentAmount?: number;

  @ApiPropertyOptional({ description: 'Chave pública do Stripe (não é segredo)' })
  @IsOptional()
  @IsString()
  stripePublishableKey?: string;
}
