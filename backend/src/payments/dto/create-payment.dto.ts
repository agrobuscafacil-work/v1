import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO', 'TRANSFER'] })
  @IsString()
  method: string;
}
