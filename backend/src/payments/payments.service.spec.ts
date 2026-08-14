import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  BadGatewayException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentCardsService } from './payment-cards.service';
import { PaymentCustomersService } from './payment-customers.service';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { PaymentStatus } from '../generated/prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let provider: any;
  let cards: any;
  let notifications: any;

  const order = {
    id: 'order-1',
    orderNumber: 'ABF-1',
    customerId: 'user-1',
    total: '999',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    supplier: { userId: 'supplier-user-1' },
    payment: null,
  };

  const customerUser = { id: 'user-1', email: 'c@t.com', role: 'CUSTOMER', document: '12345678901' };

  beforeEach(async () => {
    prisma = {
      payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      paymentCard: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      notification: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    provider = {
      name: 'MOCK',
      createPayment: jest.fn(),
      saveCard: jest.fn(),
    };

    cards = { getOwned: jest.fn() };
    notifications = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
        { provide: PaymentCardsService, useValue: cards },
        { provide: PaymentCustomersService, useValue: {} },
        { provide: PAYMENT_PROVIDER, useValue: provider },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCardPayment', () => {
    it('returns the existing payment when the idempotency key was already used', async () => {
      const existing = { id: 'pay-1', status: PaymentStatus.APPROVED };
      prisma.payment.findUnique.mockResolvedValue(existing);

      const result = await service.createCardPayment({
        orderId: 'order-1',
        user: customerUser,
        cardToken: 'mock-approved:4242:visa',
        idempotencyKey: 'key-1',
      });

      expect(result).toEqual(expect.objectContaining({ id: 'pay-1' }));
      expect(prisma.order.findUnique).not.toHaveBeenCalled();
    });

    it('rejects an order that is not PENDING', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue({ ...order, status: 'CONFIRMED' });

      await expect(
        service.createCardPayment({
          orderId: 'order-1',
          user: customerUser,
          cardToken: 'mock-approved:4242:visa',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a duplicate payment on the same order', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue({
        ...order,
        payment: { id: 'pay-x' },
      });

      await expect(
        service.createCardPayment({
          orderId: 'order-1',
          user: customerUser,
          cardToken: 'mock-approved:4242:visa',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('forbids users without access to the order', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);

      await expect(
        service.createCardPayment({
          orderId: 'order-1',
          user: { ...customerUser, id: 'intruder-1' },
          cardToken: 'mock-approved:4242:visa',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects invalid installments', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);

      await expect(
        service.createCardPayment({
          orderId: 'order-1',
          user: customerUser,
          cardToken: 'mock-approved:4242:visa',
          installments: 99,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a missing token and card id', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);

      await expect(
        service.createCardPayment({ orderId: 'order-1', user: customerUser }),
      ).rejects.toThrow(BadRequestException);
    });

    it('uses the order total from the database, not the client', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        amount: 999,
        status: PaymentStatus.PROCESSING,
        gateway: 'MOCK',
      });
      provider.createPayment.mockResolvedValue({
        gatewayId: 'mock-payment-1',
        status: 'approved',
        statusDetail: 'accredited',
      });
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          payment: { update: jest.fn().mockResolvedValue({ ...order, status: PaymentStatus.APPROVED }) },
          order: { update: jest.fn().mockResolvedValue({}) },
          notification: { create: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await service.createCardPayment({
        orderId: 'order-1',
        user: customerUser,
        cardToken: 'mock-approved:4242:visa',
      });

      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ amount: 999 }) }),
      );
      expect(provider.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 999 }),
      );
      expect(result.status).toBe(PaymentStatus.APPROVED);
    });

    it('maps a rejected provider status to DECLINED', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.PROCESSING,
      });
      provider.createPayment.mockResolvedValue({
        gatewayId: 'mock-payment-2',
        status: 'rejected',
        statusDetail: 'cc_rejected_other_reason',
      });
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          payment: { update: jest.fn().mockResolvedValue({ status: PaymentStatus.DECLINED }) },
          order: { update: jest.fn().mockResolvedValue({}) },
          notification: { create: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result: any = await service.createCardPayment({
        orderId: 'order-1',
        user: customerUser,
        cardToken: 'mock-rejected:4242:visa',
      });

      expect(result.status).toBe(PaymentStatus.DECLINED);
      expect(result.message).toContain('recusado');
    });

    it('uses the saved card path when cardId is provided', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);
      cards.getOwned.mockResolvedValue({
        id: 'card-1',
        providerCardId: 'mock-card-4242',
        brand: 'visa',
        last4: '4242',
      });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', status: PaymentStatus.PROCESSING });
      provider.createPayment.mockResolvedValue({
        gatewayId: 'mock-payment-3',
        status: 'pending',
      });
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          payment: { update: jest.fn().mockResolvedValue({ status: PaymentStatus.PENDING }) },
          order: { update: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result: any = await service.createCardPayment({
        orderId: 'order-1',
        user: customerUser,
        cardId: 'card-1',
      });

      expect(provider.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          savedCard: { providerCardId: 'mock-card-4242', paymentMethodId: 'visa' },
          cardToken: undefined,
        }),
      );
      expect(result.requiresAction).toBe(true);
    });

    it('throws NotFound when the saved card does not belong to the user', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);
      cards.getOwned.mockResolvedValue(null);

      await expect(
        service.createCardPayment({
          orderId: 'order-1',
          user: customerUser,
          cardId: 'card-x',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('wraps provider failures as BadGateway', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', status: PaymentStatus.PROCESSING });
      provider.createPayment.mockRejectedValue(new Error('gateway down'));

      await expect(
        service.createCardPayment({
          orderId: 'order-1',
          user: customerUser,
          cardToken: 'mock-approved:4242:visa',
        }),
      ).rejects.toThrow(BadGatewayException);
    });
  });

  describe('transitionFromWebhook', () => {
    const pay = {
      id: 'pay-1',
      orderId: 'order-1',
      status: PaymentStatus.PENDING,
      gatewayId: 'mock-payment-1',
    };

    it('ignores transitions outside the state machine', async () => {
      prisma.payment.findUnique.mockResolvedValue({ ...pay, status: PaymentStatus.DECLINED });

      const result = await service.transitionFromWebhook('mock-payment-1', PaymentStatus.APPROVED);

      expect(result!.status).toBe(PaymentStatus.DECLINED);
      expect(prisma.order.findUnique).not.toHaveBeenCalled();
    });

    it('approves the payment and confirms the order', async () => {
      prisma.payment.findUnique.mockResolvedValue(pay);
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          payment: {
            update: jest.fn().mockResolvedValue({ ...pay, status: PaymentStatus.APPROVED }),
          },
          order: { update: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await service.transitionFromWebhook('mock-payment-1', PaymentStatus.APPROVED);

      expect(result!.status).toBe(PaymentStatus.APPROVED);
    });

    it('returns null when no local payment matches the gateway id', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      const result = await service.transitionFromWebhook('unknown', PaymentStatus.APPROVED);

      expect(result).toBeNull();
    });
  });

  describe('access control', () => {
    it('allows the order supplier to read the payment', async () => {
      const payment = {
        id: 'pay-1',
        orderId: 'order-1',
        order: { ...order, customerId: 'other-user' },
      };
      prisma.payment.findUnique.mockResolvedValue(payment);

      const result = await service.getPaymentById('pay-1', {
        id: 'supplier-user-1',
        role: 'SUPPLIER',
      });

      expect(result.id).toBe('pay-1');
    });

    it('forbids unrelated users from reading the payment', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        order: { ...order, customerId: 'other-user', supplier: { userId: 'supplier-user-1' } },
      });

      await expect(
        service.getPaymentById('pay-1', { id: 'intruder-1', role: 'CUSTOMER' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});