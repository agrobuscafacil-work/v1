import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierTier } from '../../generated/prisma/client';

export class CreatePlanCheckoutSessionDto {
  @ApiProperty({ enum: SupplierTier })
  @IsEnum(SupplierTier)
  tier: SupplierTier;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
