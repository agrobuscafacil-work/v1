import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PAYMENT_PROVIDER,
  IPaymentProvider,
  ProviderWebhookEvent,
} from './providers/payment-provider.interface';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from '../generated/prisma/client';

@Injectable()
export class PaymentsWebhooksService {
  private readonly logger = new Logger(PaymentsWebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    @Inject(PAYMENT_PROVIDER) private provider: IPaymentProvider,
  ) {}

  async handleMercadoPago(
    rawBody: Buffer,
    xSignature: string | undefined,
    xRequestId: string | undefined,
    url: string,
  ) {
    const event: ProviderWebhookEvent = { rawBody, xSignature, xRequestId, url };

    if (!this.provider.verifyWebhook(event)) {
      this.logger.warn('Rejected webhook: invalid signature');
      throw new UnauthorizedException('Invalid signature');
    }

    const parsed = this.provider.parseWebhook(event);
    if (!parsed) {
      this.logger.warn('Rejected webhook: no payment id');
      return { received: true, note: 'ignored' };
    }

    const already = await this.prisma.paymentEvent.findUnique({
      where: {
        provider_providerEventId: { provider: this.provider.name, providerEventId: parsed.gatewayPaymentId },
      },
    });
    if (already) {
      this.logger.log(`Duplicate webhook event ignored: ${parsed.gatewayPaymentId}`);
      return { received: true, note: 'duplicate' };
    }

    if (parsed.type !== 'payment') {
      await this.recordEvent(parsed.gatewayPaymentId, parsed.type, null, null);
      return { received: true, note: 'non-payment event' };
    }

    let providerStatus;
    try {
      providerStatus = await this.provider.getPayment(parsed.gatewayPaymentId);
    } catch (error) {
      this.logger.error(
        `Webhook: failed to confirm payment ${parsed.gatewayPaymentId}: ${(error as Error).message}`,
      );
      await this.recordEvent(parsed.gatewayPaymentId, parsed.type, null, 'unconfirmed');
      return { received: true, note: 'provider unavailable, will retry' };
    }

    const localPayment = await this.prisma.payment.findUnique({
      where: { gatewayId: providerStatus.gatewayId },
    });
    if (!localPayment) {
      this.logger.warn(`Webhook: no local payment for gateway id ${providerStatus.gatewayId}`);
      await this.recordEvent(parsed.gatewayPaymentId, parsed.type, null, 'orphan');
      return { received: true, note: 'orphan event' };
    }

    const mapped = this.mapStatus(providerStatus.status);
    const transitioned = await this.paymentsService.transitionFromWebhook(
      localPayment.gatewayId!,
      mapped,
    );

    await this.recordEvent(parsed.gatewayPaymentId, parsed.type, localPayment.id, providerStatus.status);

    this.logger.log(
      `Webhook processed: payment ${localPayment.id} -> ${transitioned?.status}`,
    );
    return { received: true };
  }

  private mapStatus(status: string): PaymentStatus {
    switch (status) {
      case 'approved':
        return PaymentStatus.APPROVED;
      case 'rejected':
        return PaymentStatus.DECLINED;
      case 'cancelled':
        return PaymentStatus.CANCELLED;
      case 'pending':
      default:
        return PaymentStatus.PENDING;
    }
  }

  private async recordEvent(
    providerEventId: string,
    eventType: string,
    paymentId: string | null,
    status: string | null,
  ) {
    try {
      await this.prisma.paymentEvent.create({
        data: {
          provider: this.provider.name,
          providerEventId,
          eventType,
          paymentId,
          status,
        },
      });
    } catch (error: any) {
      if (error?.code !== 'P2002') {
        this.logger.error(`Failed to record payment event ${providerEventId}: ${error?.message}`);
      }
    }
  }
}
