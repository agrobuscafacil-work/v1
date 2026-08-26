import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SellerReviewResponseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  comment: string;
}