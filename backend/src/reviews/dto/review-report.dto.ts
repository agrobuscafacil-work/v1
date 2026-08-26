import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewReportReason {
  SPAM = 'SPAM',
  OFFENSIVE_CONTENT = 'OFFENSIVE_CONTENT',
  FAKE_REVIEW = 'FAKE_REVIEW',
  IRRELEVANT = 'IRRELEVANT',
  PERSONAL_INFORMATION = 'PERSONAL_INFORMATION',
  ADVERTISEMENT = 'ADVERTISEMENT',
  OTHER = 'OTHER',
}

export enum ReviewReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export class CreateReviewReportDto {
  @ApiProperty({ enum: ReviewReportReason })
  reason: ReviewReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class ModerateReviewReportDto {
  @ApiProperty({ enum: ['PENDING', 'RESOLVED', 'DISMISSED'] })
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}