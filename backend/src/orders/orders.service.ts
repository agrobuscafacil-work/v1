import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentMethod, Prisma } from '../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private isAdmin(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        supplierId: true,
        name: true,
        price: true,
        stock: true,
        status: true,
        deletedAt: true,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
      if (product.supplierId !== dto.supplierId) {
        throw new BadRequestException(`Product "${product.name}" does not belong to this supplier`);
      }
      if (product.deletedAt || product.status !== 'ACTIVE') {
        throw new BadRequestException(`Product "${product.name}" is not available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${product.name}" (available: ${product.stock})`);
      }
    }

    const subtotal = dto.items.reduce(
      (sum, item) => sum + Number(productMap.get(item.productId)!.price) * item.quantity,
      0,
    );
    const shippingCost = dto.shippingCost || 0;
    const discount = Math.min(dto.discount || 0, subtotal);
    const total = subtotal + shippingCost - discount;

    const order = await this.prisma.order.create({
      data: {
        orderNumber: `ABF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customerId: userId,
        supplierId: dto.supplierId,
        status: OrderStatus.PENDING,
        total,
        subtotal,
        shippingCost,
        discount,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => {
            const price = productMap.get(item.productId)!.price;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: price,
              totalPrice: new Prisma.Decimal(Number(price) * item.quantity),
            };
          }),
        },
      },
      include: { items: true },
    });
    this.logger.log(`Order created: ${order.id}`);

    if (order.supplierId) {
      const supplier = await this.prisma.supplierProfile.findUnique({
        where: { id: order.supplierId },
        select: { userId: true },
      });
      if (supplier) {
        await this.notificationsService.create({
          userId: supplier.userId,
          type: 'ORDER_CREATED',
          title: 'Novo pedido recebido',
          message: `Você recebeu um novo pedido #${order.orderNumber} de R$ ${Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
          data: { orderId: order.id, orderNumber: order.orderNumber },
        }).catch(() => undefined);
      }
    }
    await this.notificationsService.create({
      userId,
      type: 'ORDER_CREATED',
      title: 'Pedido criado',
      message: `Seu pedido #${order.orderNumber} foi criado com sucesso.`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    }).catch(() => undefined);

    return order;
  }

  async findAll(params: {
    page?: number; limit?: number; customerId?: string; supplierId?: string;
    status?: string; search?: string;
  }) {
    const { page: rawPage = 1, limit: rawLimit = 10, customerId, supplierId, status, search } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
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
        include: {
          items: { include: { product: { select: { id: true, name: true, images: true } } } },
          customer: { select: { id: true, name: true, email: true } },
          supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    return this.findAll({ customerId: userId, page, limit });
  }

  async findForSupplier(userId: string, page = 1, limit = 10) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!supplier) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
    return this.findAll({ supplierId: supplier.id, page, limit });
  }

  async findById(id: string, user?: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        supplier: { select: { userId: true } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (user) {
      const allowed = this.isAdmin(user.role)
        || order.customerId === user.id
        || order.supplier?.userId === user.id;
      if (!allowed) throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    user: { id: string; role: string },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, supplier: { select: { userId: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isAdmin(user.role) && order.supplier?.userId !== user.id) {
      throw new ForbiddenException('You cannot update this order');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status as OrderStatus,
        ...(dto.trackingCode !== undefined ? { trackingCode: dto.trackingCode } : {}),
      },
      include: { items: true },
    });
    this.logger.log(`Order ${id} status updated to ${dto.status}`);
    return updated;
  }

  async cancel(id: string, user: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isAdmin(user.role) && order.customerId !== user.id) {
      throw new ForbiddenException('You cannot cancel this order');
    }
    const nonCancellableStatuses: OrderStatus[] = [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    if (nonCancellableStatuses.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled in current status');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true },
    });
    this.logger.log(`Order ${id} cancelled`);
    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    await this.prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
    this.logger.log(`Order soft deleted: ${id}`);
    return { message: 'Order deleted successfully' };
  }
}
