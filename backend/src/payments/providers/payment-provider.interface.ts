export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface ProviderCustomer {
  providerCustomerId: string;
}

export interface ProviderCard {
  providerCardId: string;
  brand: string;
  last4: string;
  expMonth: number | null;
  expYear: number | null;
}

export type ProviderPaymentStatus = 'approved' | 'pending' | 'rejected' | 'cancelled';

export interface ProviderPaymentResult {
  gatewayId: string;
  status: ProviderPaymentStatus;
  statusDetail?: string;
  cardLastDigits?: string | null;
  cardBrand?: string | null;
}

export interface ProviderCreatePaymentParams {
  amount: number;
  description: string;
  externalReference: string;
  payerEmail: string;
  payerIdentification?: { type: string; number: string };
  cardToken?: string;
  savedCard?: { providerCardId: string; paymentMethodId: string };
  installments: number;
  idempotencyKey: string;
}

export interface ProviderWebhookEvent {
  rawBody: Buffer;
  xSignature?: string;
  xRequestId?: string;
  url: string;
}

export interface ProviderWebhookParsed {
  type: string;
  gatewayPaymentId: string;
}

export interface IPaymentProvider {
  readonly name: string;
  readonly enabled: boolean;
  createCustomer(email: string, name: string): Promise<ProviderCustomer>;
  saveCard(customerId: string, token: string): Promise<ProviderCard>;
  deleteCard(customerId: string, cardId: string): Promise<void>;
  createPayment(params: ProviderCreatePaymentParams): Promise<ProviderPaymentResult>;
  getPayment(gatewayId: string): Promise<ProviderPaymentResult>;
  verifyWebhook(event: ProviderWebhookEvent): boolean;
  parseWebhook(event: ProviderWebhookEvent): ProviderWebhookParsed | null;
}