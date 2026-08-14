import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_PROVIDER, IPaymentProvider } from './providers/payment-provider.interface';
import { PaymentCustomersService } from './payment-customers.service';

@Injectable()
export class PaymentCardsService {
  private readonly logger = new Logger(PaymentCardsService.name);

  constructor(
    private prisma: PrismaService,
    private paymentCustomers: PaymentCustomersService,
    @Inject(PAYMENT_PROVIDER) private provider: IPaymentProvider,
  ) {}

  async list(userId: string) {
    const now = new Date();
    const cards = await this.prisma.paymentCard.findMany({
      where: { userId, active: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return cards.map((card) => ({
      id: card.id,
      provider: card.provider,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: card.isDefault,
      expired:
        card.expYear != null &&
        (card.expYear < now.getFullYear() ||
          (card.expYear === now.getFullYear() && (card.expMonth ?? 0) < now.getMonth() + 1)),
      createdAt: card.createdAt,
    }));
  }

  async create(user: { id: string; email: string; name?: string | null }, token: string) {
    if (!token || token.length < 8 || token.length > 200) {
      throw new BadRequestException('Token de cartão inválido');
    }
    const customer = await this.paymentCustomers.getOrCreate(user);
    let providerCard;
    try {
      providerCard = await this.provider.saveCard(customer.providerCustomerId, token);
    } catch {
      throw new BadGatewayException('Falha ao salvar o cartão no provedor. Tente novamente.');
    }

    const existing = await this.prisma.paymentCard.findUnique({
      where: {
        userId_providerCardId: { userId: user.id, providerCardId: providerCard.providerCardId },
      },
    });
    if (existing) {
      if (!existing.active) {
        const count = await this.prisma.paymentCard.count({
          where: { userId: user.id, active: true },
        });
        const reactivated = await this.prisma.paymentCard.update({
          where: { id: existing.id },
          data: { active: true, isDefault: count === 0 },
        });
        return this.sanitize(reactivated);
      }
      return this.sanitize(existing);
    }

    const count = await this.prisma.paymentCard.count({
      where: { userId: user.id, active: true },
    });

    try {
      const card = await this.prisma.paymentCard.create({
        data: {
          userId: user.id,
          paymentCustomerId: customer.id,
          provider: this.provider.name,
          providerCardId: providerCard.providerCardId,
          brand: providerCard.brand,
          last4: providerCard.last4,
          expMonth: providerCard.expMonth,
          expYear: providerCard.expYear,
          isDefault: count === 0,
        },
      });
      this.logger.log(`Card saved for user ${user.id} (brand=${providerCard.brand})`);
      return this.sanitize(card);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const again = await this.prisma.paymentCard.findUnique({
          where: {
            userId_providerCardId: { userId: user.id, providerCardId: providerCard.providerCardId },
          },
        });
        if (again) {
          if (!again.active) {
            const count = await this.prisma.paymentCard.count({
              where: { userId: user.id, active: true },
            });
            const reactivated = await this.prisma.paymentCard.update({
              where: { id: again.id },
              data: { active: true, isDefault: count === 0 },
            });
            return this.sanitize(reactivated);
          }
          return this.sanitize(again);
        }
      }
      throw error;
    }
  }

  async remove(userId: string, cardId: string) {
    const card = await this.prisma.paymentCard.findFirst({
      where: { id: cardId, userId, active: true },
      include: { paymentCustomer: true },
    });
    if (!card) throw new NotFoundException('Cartão não encontrado');

    try {
      await this.provider.deleteCard(card.paymentCustomer.providerCustomerId, card.providerCardId);
    } catch {
      throw new BadGatewayException('Falha ao remover o cartão no provedor. Tente novamente.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentCard.update({
        where: { id: card.id },
        data: { active: false, isDefault: false },
      });
      if (card.isDefault) {
        const next = await tx.paymentCard.findFirst({
          where: { userId, active: true },
          orderBy: { createdAt: 'desc' },
        });
        if (next) {
          await tx.paymentCard.update({ where: { id: next.id }, data: { isDefault: true } });
        }
      }
    });
    this.logger.log(`Card ${cardId} removed for user ${userId}`);
    return { removed: true };
  }

  async setDefault(userId: string, cardId: string) {
    const card = await this.prisma.paymentCard.findFirst({
      where: { id: cardId, userId, active: true },
    });
    if (!card) throw new NotFoundException('Cartão não encontrado');

    await this.prisma.$transaction([
      this.prisma.paymentCard.updateMany({
        where: { userId, active: true },
        data: { isDefault: false },
      }),
      this.prisma.paymentCard.update({
        where: { id: card.id },
        data: { isDefault: true },
      }),
    ]);
    return this.sanitize({ ...card, isDefault: true });
  }

  async getOwned(userId: string, cardId: string) {
    const card = await this.prisma.paymentCard.findFirst({
      where: { id: cardId, userId, active: true },
      include: { paymentCustomer: true },
    });
    return card ?? null;
  }

  private sanitize(card: any) {
    return {
      id: card.id,
      provider: card.provider,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: card.isDefault,
      createdAt: card.createdAt,
    };
  }
}