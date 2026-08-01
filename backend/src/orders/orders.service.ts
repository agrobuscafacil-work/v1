import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: `ABF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customerId: userId,
        supplierId: dto.supplierId,
        status: OrderStatus.PENDING,
        total: dto.total,
        subtotal: dto.subtotal || dto.total,
        shippingCost: dto.shippingCost || 0,
        discount: dto.discount || 0,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    });
    this.logger.log(`Order created: ${order.id}`);
    return order;
  }

  async findAll(params: {
    page?: number; limit?: number; customerId?: string; supplierId?: string;
    status?: string; search?: string;
  }) {
    const { page = 1, limit = 10, customerId, supplierId, status, search } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        include: { items: true, customer: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    return this.findAll({ customerId: userId, page, limit });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findById(id);
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as OrderStatus, trackingCode: dto.trackingCode },
      include: { items: true },
    });
    this.logger.log(`Order ${id} status updated to ${dto.status}`);
    return order;
  }

  async cancel(id: string) {
    const order = await this.findById(id);
    const nonCancellableStatuses: OrderStatus[] = [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    if (nonCancellableStatuses.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled in current status');
    }
    return this.updateStatus(id, { status: 'CANCELLED' });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    await this.prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
    this.logger.log(`Order soft deleted: ${id}`);
    return { message: 'Order deleted successfully' };
  }
}
