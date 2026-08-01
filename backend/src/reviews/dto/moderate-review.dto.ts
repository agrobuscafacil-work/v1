import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ModerateReviewDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'FLAGGED'] })
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  moderatorId: string;
}
