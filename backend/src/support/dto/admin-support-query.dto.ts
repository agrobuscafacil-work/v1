import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min, Max, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { SupportTicketStatus } from "@prisma/client";

export class AdminSupportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}
