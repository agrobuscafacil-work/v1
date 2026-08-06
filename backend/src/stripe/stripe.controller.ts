import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreateStripeSessionDto } from './dto/create-stripe-session.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Stripe Checkout session' })
  async createCheckoutSession(@CurrentUser() user: any, @Body() dto: CreateStripeSessionDto) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = dto.successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl || `${baseUrl}/checkout`;
    return this.stripeService.createCheckoutSession(
      user.id,
      dto.items || [],
      successUrl,
      cancelUrl,
      dto.orderId,
    );
  }

  @Get('session-status/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe checkout session status' })
  async getSessionStatus(@CurrentUser() user: any, @Param('sessionId') sessionId: string) {
    return this.stripeService.retrieveSession(sessionId, user.id);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    const event = this.stripeService.constructEvent(rawBody, signature);
    if (!event) {
      this.logger.warn('Webhook ignorado: assinatura inválida ou secret ausente');
      return { received: true, note: 'signature invalid or not configured' };
    }
    await this.stripeService.handleWebhookEvent(event);
    return { received: true };
  }
}
