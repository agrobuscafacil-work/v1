import { createHmac, timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Customer, CustomerCard } from 'mercadopago';
import {
  IPaymentProvider,
  ProviderCard,
  ProviderCreatePaymentParams,
  ProviderCustomer,
  ProviderPaymentResult,
  ProviderPaymentStatus,
  ProviderWebhookEvent,
  ProviderWebhookParsed,
} from './payment-provider.interface';

function mapStatus(status?: string): ProviderPaymentStatus {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'in_process':
    case 'pending':
    case 'authorized':
      return 'pending';
    case 'cancelled':
      return 'cancelled';
    case 'rejected':
    case 'charged_back':
    default:
      return 'rejected';
  }
}

export class MercadoPagoProvider implements IPaymentProvider {
  readonly name = 'MERCADOPAGO';
  readonly enabled: boolean;

  private readonly payment: Payment;
  private readonly customer: Customer;
  private readonly card: CustomerCard;
  private readonly webhookSecret: string;
  private readonly signatureMaxAgeMs = 5 * 60 * 1000;

  constructor(config: ConfigService) {
    const accessToken = config.get<string>('MP_ACCESS_TOKEN') || '';
    this.enabled = config.get<string>('MP_ENABLED') === 'true' && accessToken.length > 0;
    this.webhookSecret = config.get<string>('MP_WEBHOOK_SECRET') || '';

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: Number(config.get<string>('MP_TIMEOUT_MS')) || 10000 },
    });
    this.payment = new Payment(client);
    this.customer = new Customer(client);
    this.card = new CustomerCard(client);
  }

  async createCustomer(email: string, name: string): Promise<ProviderCustomer> {
    const search = await this.customer.search({ options: { email } });
    const existing = search?.results?.[0];
    if (existing?.id) {
      return { providerCustomerId: String(existing.id) };
    }
    const created = await this.customer.create({
      body: { email, first_name: name },
    });
    return { providerCustomerId: String(created.id) };
  }

  async saveCard(customerId: string, token: string): Promise<ProviderCard> {
    const card = await this.card.create({ customerId, body: { token } });
    return {
      providerCardId: String(card.id),
      brand: card.payment_method?.id || '',
      last4: card.last_four_digits || '',
      expMonth: card.expiration_month ?? null,
      expYear: card.expiration_year ?? null,
    };
  }

  async deleteCard(customerId: string, cardId: string): Promise<void> {
    await this.card.remove({ customerId, cardId });
  }

  async createPayment(params: ProviderCreatePaymentParams): Promise<ProviderPaymentResult> {
    const body: Record<string, unknown> = {
      transaction_amount: params.amount,
      description: params.description,
      external_reference: params.externalReference,
      installments: params.installments,
      payer: {
        email: params.payerEmail,
        ...(params.payerIdentification
          ? { identification: params.payerIdentification }
          : {}),
      },
    };
    if (params.savedCard) {
      body.payment_method_id = params.savedCard.paymentMethodId;
      body.card_id = params.savedCard.providerCardId;
    } else if (params.cardToken) {
      body.token = params.cardToken;
    }
    const created = await this.payment.create({
      body: body as never,
      requestOptions: { idempotencyKey: params.idempotencyKey },
    });
    return {
      gatewayId: String(created.id),
      status: mapStatus(created.status),
      statusDetail: created.status_detail,
      cardLastDigits: created.card?.last_four_digits ?? null,
      cardBrand: created.payment_method_id ?? null,
    };
  }

  async getPayment(gatewayId: string): Promise<ProviderPaymentResult> {
    const found = await this.payment.get({ id: gatewayId });
    return {
      gatewayId: String(found.id),
      status: mapStatus(found.status),
      statusDetail: found.status_detail,
      cardLastDigits: found.card?.last_four_digits ?? null,
      cardBrand: found.payment_method_id ?? null,
    };
  }

  verifyWebhook(event: ProviderWebhookEvent): boolean {
    if (!this.webhookSecret) return false;
    const { xSignature, xRequestId } = event;
    if (!xSignature || !xRequestId) return false;
    const [tsPart, v1Part] = xSignature.split(',');
    if (!tsPart || !v1Part) return false;
    const ts = tsPart.trim().split('=')[1];
    const hash = v1Part.trim().split('=')[1];
    const dataId = new URL(event.url).searchParams.get('data.id');
    if (!dataId || !ts || !hash) return false;
    if (Math.abs(Date.now() - Number(ts) * 1000) > this.signatureMaxAgeMs) return false;
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = createHmac('sha256', this.webhookSecret).update(manifest).digest();
    const received = Buffer.from(hash, 'hex');
    return received.length === expected.length && timingSafeEqual(received, expected);
  }

  parseWebhook(event: ProviderWebhookEvent): ProviderWebhookParsed | null {
    const search = new URL(event.url).searchParams;
    const gatewayPaymentId = search.get('data.id');
    if (!gatewayPaymentId) return null;
    return { type: search.get('type') || 'payment', gatewayPaymentId };
  }
}