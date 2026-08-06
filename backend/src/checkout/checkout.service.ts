import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(private prisma: PrismaService) {}

  async processCheckout(userId: string, dto: { addressId: string; paymentMethod: string; couponCode?: string }) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) {
      throw new BadRequestException('This address does not belong to you');
    }

    const supplierId = cart.items[0].product.supplierId;
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    let discount = new Prisma.Decimal(0);
    let shippingCost = new Prisma.Decimal(0);

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (coupon && coupon.active && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
        discount = coupon.discountType === 'PERCENTAGE'
          ? new Prisma.Decimal(Number(subtotal) * Number(coupon.discountValue) / 100)
          : coupon.discountValue;
      }
    }

    const total = new Prisma.Decimal(Number(subtotal) - Number(discount) + Number(shippingCost));
    const orderNumber = `ABF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: userId,
        supplierId,
        subtotal: new Prisma.Decimal(subtotal),
        discount,
        shippingCost,
        total,
        addressId: dto.addressId,
        paymentMethod: dto.paymentMethod as any,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: new Prisma.Decimal(Number(item.price) * item.quantity),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    this.logger.log(`Order created: ${order.id}`);
    return order;
  }
}
