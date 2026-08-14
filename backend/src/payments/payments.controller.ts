import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentCardsService } from './payment-cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly cardsService: PaymentCardsService,
  ) {}

  @Get('cards')
  @ApiOperation({ summary: 'List current user cards (non-sensitive data only)' })
  async listCards(@CurrentUser() user: any) {
    return this.cardsService.list(user.id);
  }

  @Post('cards')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a card from a MercadoPago.js token' })
  async createCard(@CurrentUser() user: any, @Body() dto: CreateCardDto) {
    return this.cardsService.create(user, dto.token);
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Remove a saved card' })
  async removeCard(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cardsService.remove(user.id, id);
  }

  @Patch('cards/:id/default')
  @ApiOperation({ summary: 'Set a saved card as default' })
  async setDefaultCard(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cardsService.setDefault(user.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a card payment (amount is taken from the stored order)' })
  async createPayment(
    @CurrentUser() user: any,
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentsService.createCardPayment({
      orderId: dto.orderId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        document: user.document,
      },
      cardId: dto.cardId,
      cardToken: dto.cardToken,
      saveCard: dto.saveCard,
      installments: dto.installments,
      idempotencyKey,
    });
  }

  @Post('process/:orderId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process payment for order (legacy)' })
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
