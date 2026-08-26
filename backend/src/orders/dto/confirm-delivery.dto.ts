import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class ConfirmDeliveryDto {
  @ApiPropertyOptional({ description: 'Confirmar recebimento de todos os itens do pedido' })
  @IsOptional()
  @IsBoolean()
  confirmAll?: boolean;
}