import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupplierTier } from '../../generated/prisma/client';

export class UpdateSupplierTierDto {
  @ApiProperty({ enum: SupplierTier })
  @IsEnum(SupplierTier)
  tier: SupplierTier;
}
