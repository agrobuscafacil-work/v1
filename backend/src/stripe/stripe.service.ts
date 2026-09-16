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
    userId: string,
    items: StripeLineItem[],
    successUrl: string,
    cancelUrl: string,
    orderId?: string,
  ) {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado no servidor');
    }

    let lineItems: StripeLineItem[];
    if (orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { id: true, name: true } } } } },
      });
      if (!order) throw new BadRequestException('Order not found');
      if (order.customerId !== userId) {
        throw new BadRequestException('You do not own this order');
      }
      lineItems = order.items.map((item) => ({
        name: item.product?.name || 'Produto',
        priceInCents: Math.round(Number(item.unitPrice) * 100),
        quantity: item.quantity,
      }));
    } else {
      if (!items?.length) throw new BadRequestException('No items provided');
      lineItems = items;
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems.map((item) => ({
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

  private planPriceInCents(tier: string): number {
    switch (tier) {
      case 'STANDARD':
        return 9900;
      case 'PREMIUM':
        return 29900;
      case 'BASIC':
      default:
        return 0;
    }
  }

  async createPlanCheckoutSession(
    userId: string,
    tier: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado no servidor');
    }
    if (!['BASIC', 'STANDARD', 'PREMIUM'].includes(tier)) {
      throw new BadRequestException('Plano inválido');
    }

    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true, companyName: true },
    });
    if (!supplier) {
      throw new BadRequestException('Supplier profile not found');
    }

    const priceInCents = this.planPriceInCents(tier);
    if (priceInCents <= 0) {
      throw new BadRequestException('Este plano é gratuito e não requer pagamento');
    }

    const subscription = await this.prisma.supplierSubscription.create({
      data: {
        supplierId: supplier.id,
        userId,
        tier: tier as any,
        amount: priceInCents / 100,
        currency: this.currency,
        status: 'PENDING',
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: this.currency,
            product_data: {
              name: `Plano ${tier} - AgroBuscaFácil`,
              description: `Assinatura mensal do plano ${tier} para ${supplier.companyName}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'plan_subscription',
        subscriptionId: subscription.id,
        supplierId: supplier.id,
        userId,
        tier,
      },
    });

    await this.prisma.supplierSubscription.update({
      where: { id: subscription.id },
      data: { stripeSessionId: session.id },
    });

    this.logger.log(`Stripe plan session created: ${session.id} (subscription ${subscription.id}, tier ${tier})`);
    return {
      sessionId: session.id,
      url: session.url,
      expiresAt: session.expires_at,
      subscriptionId: subscription.id,
    };
  }

  async getPlanRevenueSummary() {
    const approved = await this.prisma.supplierSubscription.findMany({
      where: { status: 'APPROVED' },
      include: {
        supplier: { select: { id: true, companyName: true, email: true } },
      },
      orderBy: { paidAt: 'desc' },
      take: 500,
    });

    const total = approved.reduce((sum, s) => sum + Number(s.amount), 0);
    const byTier: Record<string, { count: number; total: number }> = {};
    for (const s of approved) {
      const key = String(s.tier);
      if (!byTier[key]) byTier[key] = { count: 0, total: 0 };
      byTier[key].count += 1;
      byTier[key].total += Number(s.amount);
    }

    const monthly: Record<string, { month: string; total: number; count: number }> = {};
    for (const s of approved) {
      const d = s.paidAt ? new Date(s.paidAt) : new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) {
        monthly[key] = {
          month: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          total: 0,
          count: 0,
        };
      }
      monthly[key].total += Number(s.amount);
      monthly[key].count += 1;
    }

    return {
      total,
      count: approved.length,
      byTier,
      monthly: Object.entries(monthly)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([, v]) => v),
      subscriptions: approved.map((s) => ({
        id: s.id,
        tier: s.tier,
        amount: Number(s.amount),
        currency: s.currency,
        status: s.status,
        paidAt: s.paidAt,
        createdAt: s.createdAt,
        supplier: s.supplier,
      })),
    };
  }

  async retrieveSession(sessionId: string, userId?: string) {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado no servidor');
    }
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;
    if (userId && orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true },
      });
      if (!order || order.customerId !== userId) {
        throw new BadRequestException('You do not have access to this session');
      }
    }
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
    if (session.metadata?.type === 'plan_subscription') {
      await this.handlePlanSubscriptionCompleted(session);
      return;
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      this.logger.log(`Checkout completado sem orderId: ${session.id}`);
      return;
    }

    const method = this.mapMethod(session.payment_method_types?.[0]);
    const amount = (session.amount_total || 0) / 100;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true },
    });
    if (!order) {
      this.logger.warn(`Order ${orderId} not found for checkout ${session.id}`);
      return;
    }
    const expectedCents = Math.round(Number(order.total) * 100);
    if (session.amount_total && Math.abs((session.amount_total || 0) - expectedCents) > 1) {
      this.logger.warn(
        `Amount mismatch for order ${orderId}: paid ${session.amount_total} expected ${expectedCents}`,
      );
      return;
    }

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

  private async handlePlanSubscriptionCompleted(session: Stripe.Checkout.Session) {
    const subscriptionId = session.metadata?.subscriptionId;
    const tier = session.metadata?.tier;
    const supplierId = session.metadata?.supplierId;
    if (!subscriptionId) {
      this.logger.warn(`Plan checkout sem subscriptionId: ${session.id}`);
      return;
    }

    const subscription = await this.prisma.supplierSubscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) {
      this.logger.warn(`Subscription ${subscriptionId} not found for checkout ${session.id}`);
      return;
    }
    if (subscription.status === 'APPROVED') {
      this.logger.log(`Subscription ${subscriptionId} já aprovada`);
      return;
    }

    await this.prisma.supplierSubscription.update({
      where: { id: subscriptionId },
      data: { status: 'APPROVED', paidAt: new Date() },
    });

    if (supplierId && tier && ['BASIC', 'STANDARD', 'PREMIUM'].includes(tier)) {
      await this.prisma.supplierProfile.update({
        where: { id: supplierId },
        data: { tier: tier as any },
      });
      this.logger.log(`Supplier ${supplierId} atualizado para o plano ${tier}`);
    }
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
