import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({
    enum: [
      'CREDIT_CARD',
      'DEBIT_CARD',
      'PIX',
      'BOLETO',
      'BANK_TRANSFER',
      'DEPOSIT',
      'CASH',
    ],
  })
  @IsString()
  @IsIn([
    'CREDIT_CARD',
    'DEBIT_CARD',
    'PIX',
    'BOLETO',
    'BANK_TRANSFER',
    'DEPOSIT',
    'CASH',
  ])
  method: string;
}