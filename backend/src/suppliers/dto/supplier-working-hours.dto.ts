import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SupplierWorkingHourDto {
  @ApiProperty({ description: '0 = domingo, 1 = segunda ... 6 = sábado' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty()
  @IsBoolean()
  isOpen: boolean;

  @ApiProperty({ example: '08:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  openTime?: string;

  @ApiProperty({ example: '18:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closeTime?: string;
}

export class UpdateSupplierWorkingHoursDto {
  @ApiProperty({ type: [SupplierWorkingHourDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierWorkingHourDto)
  hours: SupplierWorkingHourDto[];
}