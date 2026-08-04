import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

export interface StripeLineItem {
  name: string;
  description?: string;
  priceInCents: number;
  quantity: number;
  currency?: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly currency: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY não configurada. Integração Stripe desativada.');
    }
    this.stripe = new Stripe(secretKey || 'sk_test_invalid', {
      apiVersion: '2026-07-29.dahlia',
    });
    this.currency = this.configService.get<string>('STRIPE_CURRENCY') || 'brl';
  }

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('STRIPE_SECRET_KEY'));
  }

  async createCheckoutSession(
    items: StripeLineItem[],
    successUrl: string,
    cancelUrl: string,
    orderId?: string,
  ) {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado no servidor');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((item) => ({
        price_data: {
          currency: item.currency || this.currency,
          product_data: {
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
          },
          unit_amount: Math.round(item.priceInCents),
        },
        quantity: item.quantity,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: orderId ? { orderId } : {},
    });

    this.logger.log(`Stripe session created: ${session.id}`);
    return {
      sessionId: session.id,
      url: session.url,
      expiresAt: session.expires_at,
    };
  }

  async retrieveSession(sessionId: string) {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado no servidor');
    }
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email || null,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentMethodTypes: session.payment_method_types,
      metadata: session.metadata,
    };
  }

  constructEvent(rawBody: Buffer | string, signature: string): Stripe.Event | null {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || !signature) return null;
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      this.logger.warn(`Webhook signature verification failed: ${error?.message}`);
      return null;
    }
  }

  async handleWebhookEvent(event: Stripe.Event) {    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'checkout.session.expired': {
        this.logger.warn(
          `Checkout session expired: ${(event.data.object as Stripe.Checkout.Session).id}`,
        );
        break;
      }
      default:
        this.logger.log(`Evento Stripe não tratado: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      this.logger.log(`Checkout completado sem orderId: ${session.id}`);
      return;
    }

    const method = this.mapMethod(session.payment_method_types?.[0]);
    const amount = (session.amount_total || 0) / 100;

    const existing = await this.prisma.payment
      .findUnique({ where: { orderId } })
      .catch(() => null);

    if (existing) {
      await this.prisma.payment.update({
        where: { id: existing.id },
        data: {
          status: 'APPROVED',
          method,
          gatewayId: session.id,
          paidAt: new Date(),
        },
      });
      this.logger.log(`Payment APPROVED para order ${orderId}`);
    } else {
      await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          method,
          status: 'APPROVED',
          gatewayId: session.id,
          paidAt: new Date(),
        },
      });
      this.logger.log(`Payment criado (APPROVED) para order ${orderId}`);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });
  }

  private mapMethod(type?: string) {
    switch (type) {
      case 'card':
        return 'CREDIT_CARD';
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'BOLETO';
      default:
        return 'CREDIT_CARD';
    }
  }
}
