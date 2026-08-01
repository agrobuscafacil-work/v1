import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SupplierApprovalDto {
  @ApiProperty()
  @IsBoolean()
  approved: boolean;
}
