import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PaymentMethod, PaymentStatus } from '../generated/prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  private isAdmin(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private async assertOrderAccess(order: any, user: { id: string; role: string }) {
    if (this.isAdmin(user.role)) return;
    if (order.customerId === user.id) return;
    if (order.supplier?.userId === user.id) return;
    throw new ForbiddenException('You do not have access to this payment');
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
    return payment;
  }

  async getPaymentById(paymentId: string, user: { id: string; role: string }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { supplier: { select: { userId: true } } } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.assertOrderAccess(payment.order, user);
    return payment;
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
}
