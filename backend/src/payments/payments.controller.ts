import {
  Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process/:orderId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process payment for order' })
  async processPayment(@CurrentUser() user: any, @Param('orderId') orderId: string, @Body('method') method: string) {
    return this.paymentsService.processPayment(orderId, method, user);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order' })
  async findByOrder(@CurrentUser() user: any, @Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.paymentsService.getPaymentById(id, user);
  }
}
