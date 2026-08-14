import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  PaymentMethod,
  PaymentStatus,
} from '../generated/prisma/client';
import { PAYMENT_PROVIDER, IPaymentProvider } from './providers/payment-provider.interface';
import { PaymentCardsService } from './payment-cards.service';
import { PaymentCustomersService } from './payment-customers.service';

export interface CreateCardPaymentInput {
  orderId: string;
  user: { id: string; email: string; name?: string | null; role: string; document?: string | null };
  cardId?: string;
  cardToken?: string;
  saveCard?: boolean;
  installments?: number;
  idempotencyKey?: string;
}

const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PROCESSING: ['APPROVED', 'DECLINED', 'CANCELLED'],
  PENDING: ['APPROVED', 'DECLINED', 'CANCELLED'],
  APPROVED: ['REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK'],
  DECLINED: [],
  REFUNDED: [],
  PARTIALLY_REFUNDED: [],
  CANCELLED: [],
  CHARGEBACK: [],
};

function mapProviderStatus(status: string): PaymentStatus {
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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private cardsService: PaymentCardsService,
    private paymentCustomers: PaymentCustomersService,
    @Inject(PAYMENT_PROVIDER) private provider: IPaymentProvider,
  ) {}

  private isAdmin(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private async assertOrderAccess(order: any, user: { id: string; role: string }) {
    if (this.isAdmin(user.role)) return;
    if (order.customerId === user.id) return;
    if (order.supplier?.userId === user.id) return;
    throw new ForbiddenException('You do not have access to this payment');
  }

  private async loadOrderForPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { supplier: { select: { userId: true } }, payment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createCardPayment(input: CreateCardPaymentInput) {
    const {
      orderId,
      user,
      cardId,
      cardToken,
      saveCard,
      installments,
      idempotencyKey,
    } = input;

    if (idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return this.publicView(existing);
    }

    const order = await this.loadOrderForPayment(orderId);
    await this.assertOrderAccess(order, user);
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order already processed');
    }
    if (order.payment) {
      throw new BadRequestException('Payment already exists for this order');
    }

    const parsedInstallments = installments ?? 1;
    if (!Number.isInteger(parsedInstallments) || parsedInstallments < 1 || parsedInstallments > 12) {
      throw new BadRequestException('Invalid number of installments');
    }

    if (!cardToken && !cardId) {
      throw new BadRequestException('A card token or saved card is required');
    }

    const amount = Number(order.total);
    const payerIdentification =
      user.document && /^[\d.\\/-]+$/.test(user.document)
        ? { type: user.document.replace(/[^\d]/g, '').length > 11 ? 'CNPJ' : 'CPF', number: user.document.replace(/[^\d]/g, '') }
        : undefined;

    let savedCardRef: { providerCardId: string; paymentMethodId: string } | undefined;
    let cardTokenRef: string | undefined;
    let localCard = null;

    if (cardId) {
      localCard = await this.cardsService.getOwned(user.id, cardId);
      if (!localCard) throw new NotFoundException('Cartão não encontrado');
      savedCardRef = {
        providerCardId: localCard.providerCardId,
        paymentMethodId: localCard.brand || 'card',
      };
    } else {
      if (saveCard) {
        const customer = await this.paymentCustomers.getOrCreate(user);
        let providerCard;
        try {
          providerCard = await this.provider.saveCard(customer.providerCustomerId, cardToken!);
        } catch {
          throw new BadGatewayException('Falha ao salvar o cartão. Tente novamente.');
        }
        const count = await this.prisma.paymentCard.count({
          where: { userId: user.id, active: true },
        });
        try {
          localCard = await this.prisma.paymentCard.create({
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
        } catch (error: any) {
          if (error?.code === 'P2002') {
            localCard = await this.prisma.paymentCard.findUnique({
              where: {
                userId_providerCardId: { userId: user.id, providerCardId: providerCard.providerCardId },
              },
            });
          } else {
            throw error;
          }
        }
        savedCardRef = {
          providerCardId: localCard!.providerCardId,
          paymentMethodId: localCard!.brand || 'card',
        };
      } else {
        cardTokenRef = cardToken;
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PROCESSING,
        gateway: this.provider.name,
        installments: parsedInstallments,
        cardLastDigits: localCard?.last4 ?? null,
        cardBrand: localCard?.brand ?? null,
        idempotencyKey: idempotencyKey || null,
      },
    });

    let result;
    try {
      result = await this.provider.createPayment({
        amount,
        description: `Pedido ${order.orderNumber}`,
        externalReference: order.orderNumber,
        payerEmail: user.email,
        payerIdentification,
        savedCard: savedCardRef,
        cardToken: cardTokenRef,
        installments: parsedInstallments,
        idempotencyKey: idempotencyKey || payment.id,
      });
    } catch (error) {
      this.logger.error(`Provider payment failed for payment ${payment.id}: ${(error as Error).message}`);
      throw new BadGatewayException('Falha ao processar o pagamento. Tente novamente.');
    }

    const mapped = mapProviderStatus(result.status);
    const terminal = await this.applyFinalStatus(payment.id, order, mapped, result);

    return {
      ...this.publicView(terminal),
      requiresAction: mapped === PaymentStatus.PENDING,
      message:
        mapped === PaymentStatus.APPROVED
          ? 'Pagamento aprovado'
          : mapped === PaymentStatus.DECLINED
            ? 'Pagamento recusado. Verifique os dados do cartão.'
            : 'Pagamento em análise',
    };
  }

  private async applyFinalStatus(
    paymentId: string,
    order: any,
    status: PaymentStatus,
    result: { gatewayId: string; statusDetail?: string; cardLastDigits?: string | null; cardBrand?: string | null },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          gatewayId: result.gatewayId,
          cardLastDigits: result.cardLastDigits ?? null,
          cardBrand: result.cardBrand ?? null,
          paidAt: status === PaymentStatus.APPROVED ? new Date() : undefined,
        },
      });

      const orderUpdate: any = { paymentStatus: status };
      if (status === PaymentStatus.APPROVED) {
        orderUpdate.status = 'CONFIRMED';
      }
      await tx.order.update({ where: { id: order.id }, data: orderUpdate });

      if (status === PaymentStatus.APPROVED) {
        await tx.notification.create({
          data: {
            userId: order.customerId,
            type: 'PAYMENT_CONFIRMED',
            title: 'Pagamento confirmado',
            message: `O pagamento do pedido ${order.orderNumber} foi aprovado.`,
            data: { orderId: order.id, paymentId },
          },
        });
      } else if (status === PaymentStatus.DECLINED) {
        await tx.notification.create({
          data: {
            userId: order.customerId,
            type: 'PAYMENT_FAILED',
            title: 'Pagamento recusado',
            message: `O pagamento do pedido ${order.orderNumber} foi recusado.`,
            data: { orderId: order.id, paymentId },
          },
        });
      }
      return payment;
    });
  }

  async transitionFromWebhook(gatewayId: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({ where: { gatewayId } });
    if (!payment) return null;

    const allowed = ALLOWED_TRANSITIONS[payment.status] || [];
    if (!allowed.includes(status)) {
      this.logger.warn(
        `Ignoring webhook transition ${payment.status} -> ${status} for payment ${payment.id}`,
      );
      return payment;
    }

    const order = await this.prisma.order.findUnique({ where: { id: payment.orderId } });
    if (!order) return payment;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          paidAt: status === PaymentStatus.APPROVED ? new Date() : undefined,
          refundedAt: status === PaymentStatus.REFUNDED || status === PaymentStatus.PARTIALLY_REFUNDED ? new Date() : undefined,
        },
      });
      const orderUpdate: any = { paymentStatus: status };
      if (status === PaymentStatus.APPROVED) {
        orderUpdate.status = 'CONFIRMED';
      } else if (status === PaymentStatus.REFUNDED || status === PaymentStatus.PARTIALLY_REFUNDED) {
        orderUpdate.status = status === PaymentStatus.REFUNDED ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      }
      await tx.order.update({ where: { id: order.id }, data: orderUpdate });
      return updated;
    });
  }

  async processPayment(orderId: string, method: string, user: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, supplier: { select: { userId: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    await this.assertOrderAccess(order, user);
    if (order.payment) throw new BadRequestException('Payment already exists for this order');

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        method: method as PaymentMethod,
        status: PaymentStatus.PROCESSING,
      },
    });

    this.logger.log(`Payment created for order ${orderId}: ${payment.id}`);
    return payment;
  }

  async getPaymentStatus(orderId: string, user: { id: string; role: string }) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { supplier: { select: { userId: true } } } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.assertOrderAccess(payment.order, user);
    return this.publicView(payment);
  }

  async getPaymentById(paymentId: string, user: { id: string; role: string }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { supplier: { select: { userId: true } } } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.assertOrderAccess(payment.order, user);
    return this.publicView(payment);
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status as PaymentStatus,
        paidAt: status === 'APPROVED' ? new Date() : undefined,
      },
    });
    return payment;
  }

  async findByOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: { select: { id: true, orderNumber: true, total: true, status: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.order.status !== 'PENDING') {
      throw new BadRequestException('Order already processed');
    }

    return payment;
  }

  private publicView(payment: any) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      gateway: payment.gateway,
      gatewayId: payment.gatewayId,
      cardLastDigits: payment.cardLastDigits,
      cardBrand: payment.cardBrand,
      installments: payment.installments,
      paidAt: payment.paidAt,
      refundedAt: payment.refundedAt,
      createdAt: payment.createdAt,
    };
  }
}