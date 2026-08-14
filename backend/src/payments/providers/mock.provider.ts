import { BadGatewayException } from '@nestjs/common';
import {
  IPaymentProvider,
  ProviderCard,
  ProviderCreatePaymentParams,
  ProviderCustomer,
  ProviderPaymentResult,
  ProviderWebhookEvent,
  ProviderWebhookParsed,
} from './payment-provider.interface';

export class MockPaymentProvider implements IPaymentProvider {
  readonly name = 'MOCK';
  readonly enabled = true;

  async createCustomer(email: string): Promise<ProviderCustomer> {
    return { providerCustomerId: `mock-customer-${email.replace(/[^a-z0-9]/gi, '')}` };
  }

  async saveCard(_customerId: string, token: string): Promise<ProviderCard> {
    const meta = token.split(':');
    if (meta.length < 3 || !meta[0].startsWith('mock')) {
      throw new BadGatewayException('Invalid card token');
    }
    return {
      providerCardId: `mock-card-${meta[1]}`,
      brand: meta[2] === 'visa' ? 'visa' : 'master',
      last4: meta[1].slice(-4),
      expMonth: 12,
      expYear: new Date().getFullYear() + 3,
    };
  }

  async deleteCard(): Promise<void> {}

  async createPayment(params: ProviderCreatePaymentParams): Promise<ProviderPaymentResult> {
    const token = params.cardToken || '';
    const mock = token.startsWith('mock-approved');
    const reject = token.startsWith('mock-rejected');
    const status = mock ? 'approved' : reject ? 'rejected' : 'pending';
    return {
      gatewayId: `mock-payment-${Date.now()}`,
      status,
      statusDetail: mock ? 'accredited' : reject ? 'cc_rejected_other_reason' : 'pending_waiting_transfer',
      cardLastDigits: token.split(':')[1] || null,
      cardBrand: 'visa',
    };
  }

  async getPayment(gatewayId: string): Promise<ProviderPaymentResult> {
    return {
      gatewayId,
      status: 'approved',
      statusDetail: 'accredited',
      cardLastDigits: null,
      cardBrand: null,
    };
  }

  verifyWebhook(event: ProviderWebhookEvent): boolean {
    return event.xSignature === 'mock-signature';
  }

  parseWebhook(event: ProviderWebhookEvent): ProviderWebhookParsed | null {
    const search = new URL(event.url).searchParams;
    const gatewayPaymentId = search.get('data.id');
    if (!gatewayPaymentId) return null;
    return { type: search.get('type') || 'payment', gatewayPaymentId };
  }
}