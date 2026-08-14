import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, BadGatewayException, NotFoundException } from '@nestjs/common';
import { PaymentCardsService } from './payment-cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentCustomersService } from './payment-customers.service';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';

describe('PaymentCardsService', () => {
  let service: PaymentCardsService;
  let prisma: any;
  let provider: any;
  let customers: any;

  const user = { id: 'user-1', email: 'cliente@teste.com', name: 'Cliente' };

  const cardRow = {
    id: 'card-1',
    userId: 'user-1',
    paymentCustomerId: 'pc-1',
    provider: 'MOCK',
    providerCardId: 'mock-card-4242',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2030,
    isDefault: true,
    active: true,
    createdAt: new Date('2026-08-14T00:00:00Z'),
  };

  beforeEach(async () => {
    prisma = {
      paymentCard: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    provider = {
      name: 'MOCK',
      saveCard: jest.fn(),
      deleteCard: jest.fn(),
    };

    customers = {
      getOrCreate: jest.fn().mockResolvedValue({
        id: 'pc-1',
        providerCustomerId: 'mock-customer-cliente',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentCardsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaymentCustomersService, useValue: customers },
        { provide: PAYMENT_PROVIDER, useValue: provider },
      ],
    }).compile();

    service = module.get<PaymentCardsService>(PaymentCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('returns only active cards sanitized, default first', async () => {
      prisma.paymentCard.findMany.mockResolvedValue([
        { ...cardRow, id: 'card-2', last4: '1111', isDefault: false },
        cardRow,
      ]);

      const result = await service.list('user-1');

      expect(prisma.paymentCard.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', active: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'card-2',
          brand: 'visa',
          last4: '1111',
          isDefault: false,
          expired: false,
        }),
      );
      expect(result[0]).not.toHaveProperty('providerCardId');
    });

    it('marks an expired card', async () => {
      const now = new Date();
      const expired = {
        ...cardRow,
        expMonth: 1,
        expYear: now.getFullYear() - 1,
      };
      prisma.paymentCard.findMany.mockResolvedValue([expired]);

      const [result] = await service.list('user-1');

      expect(result.expired).toBe(true);
    });
  });

  describe('create', () => {
    it('rejects an invalid token', async () => {
      await expect(service.create(user, 'short')).rejects.toThrow(BadRequestException);
      expect(provider.saveCard).not.toHaveBeenCalled();
    });

    it('saves a card and sets it as default when none exists', async () => {
      provider.saveCard.mockResolvedValue({
        providerCardId: 'mock-card-4242',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
      });
      prisma.paymentCard.findUnique.mockResolvedValue(null);
      prisma.paymentCard.count.mockResolvedValue(0);
      prisma.paymentCard.create.mockResolvedValue(cardRow);

      const result = await service.create(user, 'mock-approved:4242:visa');

      expect(prisma.paymentCard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          paymentCustomerId: 'pc-1',
          provider: 'MOCK',
          providerCardId: 'mock-card-4242',
          brand: 'visa',
          last4: '4242',
          isDefault: true,
        }),
      });
      expect(result).toEqual(expect.objectContaining({ id: 'card-1', isDefault: true }));
      expect(result).not.toHaveProperty('providerCardId');
    });

    it('returns the existing card without duplicating', async () => {
      provider.saveCard.mockResolvedValue({
        providerCardId: 'mock-card-4242',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
      });
      prisma.paymentCard.findUnique.mockResolvedValue(cardRow);

      const result = await service.create(user, 'mock-approved:4242:visa');

      expect(prisma.paymentCard.create).not.toHaveBeenCalled();
      expect(result.id).toBe('card-1');
    });

    it('reactivates a soft-deleted card and promotes it when no active card exists', async () => {
      const inactive = { ...cardRow, active: false, isDefault: false };
      provider.saveCard.mockResolvedValue({
        providerCardId: 'mock-card-4242',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
      });
      prisma.paymentCard.findUnique.mockResolvedValue(inactive);
      prisma.paymentCard.count.mockResolvedValue(0);
      prisma.paymentCard.update.mockResolvedValue({ ...inactive, active: true, isDefault: true });

      const result = await service.create(user, 'mock-approved:4242:visa');

      expect(prisma.paymentCard.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { active: true, isDefault: true },
      });
      expect(result.id).toBe('card-1');
      expect(prisma.paymentCard.create).not.toHaveBeenCalled();
    });

    it('reactivates on P2002 race and keeps default off when other cards exist', async () => {
      provider.saveCard.mockResolvedValue({
        providerCardId: 'mock-card-4242',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
      });
      prisma.paymentCard.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...cardRow, active: false, isDefault: false });
      prisma.paymentCard.count.mockResolvedValue(2);
      prisma.paymentCard.create.mockRejectedValue({ code: 'P2002' });
      prisma.paymentCard.update.mockResolvedValue({
        ...cardRow,
        active: true,
        isDefault: false,
      });

      const result = await service.create(user, 'mock-approved:4242:visa');

      expect(result.isDefault).toBe(false);
      expect(prisma.paymentCard.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { active: true, isDefault: false },
      });
    });

    it('wraps provider failures as BadGateway', async () => {
      provider.saveCard.mockRejectedValue(new Error('provider down'));
      prisma.paymentCard.findUnique.mockResolvedValue(null);

      await expect(service.create(user, 'mock-approved:4242:visa')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('remove', () => {
    it('soft-deletes the card and promotes another when it was default', async () => {
      prisma.paymentCard.findFirst.mockResolvedValue({
        ...cardRow,
        paymentCustomer: { providerCustomerId: 'mock-customer-cliente' },
      });
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          paymentCard: {
            update: jest.fn().mockResolvedValue({}),
            findFirst: jest.fn().mockResolvedValue({ ...cardRow, id: 'card-2' }),
          },
        };
        return fn(tx);
      });

      const result = await service.remove('user-1', 'card-1');

      expect(provider.deleteCard).toHaveBeenCalledWith(
        'mock-customer-cliente',
        'mock-card-4242',
      );
      expect(result).toEqual({ removed: true });
    });

    it('throws NotFound when the card does not belong to the user', async () => {
      prisma.paymentCard.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'card-x')).rejects.toThrow(NotFoundException);
      expect(provider.deleteCard).not.toHaveBeenCalled();
    });
  });

  describe('setDefault', () => {
    it('unsets the others and sets the target as default', async () => {
      prisma.paymentCard.findFirst.mockResolvedValue(cardRow);
      prisma.$transaction.mockResolvedValue([]);

      const result = await service.setDefault('user-1', 'card-1');

      expect(prisma.paymentCard.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', active: true },
        data: { isDefault: false },
      });
      expect(prisma.paymentCard.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { isDefault: true },
      });
      expect(result.isDefault).toBe(true);
    });

    it('throws NotFound for a card of another user', async () => {
      prisma.paymentCard.findFirst.mockResolvedValue(null);

      await expect(service.setDefault('user-1', 'card-x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOwned', () => {
    it('returns null for cards outside the user scope', async () => {
      prisma.paymentCard.findFirst.mockResolvedValue(null);

      const result = await service.getOwned('user-1', 'card-x');

      expect(result).toBeNull();
      expect(prisma.paymentCard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'card-x', userId: 'user-1', active: true },
        }),
      );
    });
  });
});