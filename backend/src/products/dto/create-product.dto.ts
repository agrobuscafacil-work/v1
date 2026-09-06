import { IsString, IsNumber, IsOptional, IsArray, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Valor padrão do frete em reais' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingBaseCost?: number;

  @ApiPropertyOptional({ description: 'Valor adicional do frete em reais quando exceder a distância gratuita' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAdditionalCost?: number;

  @ApiPropertyOptional({ description: 'Distância máxima em quilômetros sem cobrança adicional' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFreeDistanceKm?: number;

  @ApiPropertyOptional({ enum: ['ALL_BRAZIL', 'LOCAL_REGION'] })
  @IsOptional()
  @IsString()
  shippingCoverage?: 'ALL_BRAZIL' | 'LOCAL_REGION';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  specifications?: any;

}
