import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async processPayment(orderId: string, method: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
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

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
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
