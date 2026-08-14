import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PaymentsWebhooksService } from './payments-webhooks.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { PaymentStatus } from '../generated/prisma/client';

describe('PaymentsWebhooksService', () => {
  let service: PaymentsWebhooksService;
  let prisma: any;
  let provider: any;
  let paymentsService: any;

  beforeEach(async () => {
    prisma = {
      paymentEvent: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
      },
    };

    provider = {
      name: 'MOCK',
      verifyWebhook: jest.fn(),
      parseWebhook: jest.fn(),
      getPayment: jest.fn(),
    };

    paymentsService = { transitionFromWebhook: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsWebhooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: PAYMENT_PROVIDER, useValue: provider },
      ],
    }).compile();

    service = module.get<PaymentsWebhooksService>(PaymentsWebhooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const buffer = Buffer.from('{"data":{"id":"mock-payment-1"}}');

  it('rejects a webhook with an invalid signature', async () => {
    provider.verifyWebhook.mockReturnValue(false);

    await expect(
      service.handleMercadoPago(buffer, 'bad-signature', 'req-1', 'http://x/webhook'),
    ).rejects.toThrow(UnauthorizedException);
    expect(provider.parseWebhook).not.toHaveBeenCalled();
  });

  it('ignores events without a payment id', async () => {
    provider.verifyWebhook.mockReturnValue(true);
    provider.parseWebhook.mockReturnValue(null);

    const result = await service.handleMercadoPago(buffer, 'mock-signature', 'req-1', 'http://x/webhook');

    expect(result).toEqual({ received: true, note: 'ignored' });
    expect(prisma.paymentEvent.create).not.toHaveBeenCalled();
  });

  it('deduplicates repeated events', async () => {
    provider.verifyWebhook.mockReturnValue(true);
    provider.parseWebhook.mockReturnValue({ type: 'payment', gatewayPaymentId: 'mock-payment-1' });
    prisma.paymentEvent.findUnique.mockResolvedValue({ id: 'event-1' });

    const result = await service.handleMercadoPago(buffer, 'mock-signature', 'req-1', 'http://x/webhook');

    expect(result).toEqual({ received: true, note: 'duplicate' });
    expect(provider.getPayment).not.toHaveBeenCalled();
  });

  it('records non-payment events without confirming a payment', async () => {
    provider.verifyWebhook.mockReturnValue(true);
    provider.parseWebhook.mockReturnValue({ type: 'plan.created', gatewayPaymentId: 'plan-1' });
    prisma.paymentEvent.findUnique.mockResolvedValue(null);
    prisma.paymentEvent.create.mockResolvedValue({});

    const result = await service.handleMercadoPago(buffer, 'mock-signature', 'req-1', 'http://x/webhook');

    expect(result).toEqual({ received: true, note: 'non-payment event' });
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: 'MOCK',
        providerEventId: 'plan-1',
        eventType: 'plan.created',
        paymentId: null,
        status: null,
      }),
    });
    expect(provider.getPayment).not.toHaveBeenCalled();
  });

  it('transitions the local payment and records the event', async () => {
    provider.verifyWebhook.mockReturnValue(true);
    provider.parseWebhook.mockReturnValue({ type: 'payment', gatewayPaymentId: 'mock-payment-1' });
    prisma.paymentEvent.findUnique.mockResolvedValue(null);
    provider.getPayment.mockResolvedValue({
      gatewayId: 'mock-payment-1',
      status: 'approved',
    });
    prisma.payment.findUnique.mockResolvedValue({ id: 'pay-1', gatewayId: 'mock-payment-1' });
    paymentsService.transitionFromWebhook.mockResolvedValue({
      id: 'pay-1',
      status: PaymentStatus.APPROVED,
    });
    prisma.paymentEvent.create.mockResolvedValue({});

    const result = await service.handleMercadoPago(buffer, 'mock-signature', 'req-1', 'http://x/webhook');

    expect(paymentsService.transitionFromWebhook).toHaveBeenCalledWith(
      'mock-payment-1',
      PaymentStatus.APPROVED,
    );
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerEventId: 'mock-payment-1',
        paymentId: 'pay-1',
        status: 'approved',
      }),
    });
    expect(result).toEqual({ received: true });
  });

  it('handles orphan events without a local payment', async () => {
    provider.verifyWebhook.mockReturnValue(true);
    provider.parseWebhook.mockReturnValue({ type: 'payment', gatewayPaymentId: 'mock-payment-1' });
    prisma.paymentEvent.findUnique.mockResolvedValue(null);
    provider.getPayment.mockResolvedValue({ gatewayId: 'mock-payment-1', status: 'approved' });
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.paymentEvent.create.mockResolvedValue({});

    const result = await service.handleMercadoPago(buffer, 'mock-signature', 'req-1', 'http://x/webhook');

    expect(result).toEqual({ received: true, note: 'orphan event' });
    expect(paymentsService.transitionFromWebhook).not.toHaveBeenCalled();
  });

  it('records an unconfirmed event when the provider is unavailable', async () => {
    provider.verifyWebhook.mockReturnValue(true);
    provider.parseWebhook.mockReturnValue({ type: 'payment', gatewayPaymentId: 'mock-payment-1' });
    prisma.paymentEvent.findUnique.mockResolvedValue(null);
    provider.getPayment.mockRejectedValue(new Error('timeout'));
    prisma.paymentEvent.create.mockResolvedValue({});

    const result = await service.handleMercadoPago(buffer, 'mock-signature', 'req-1', 'http://x/webhook');

    expect(result).toEqual({ received: true, note: 'provider unavailable, will retry' });
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'unconfirmed' }),
    });
  });
});