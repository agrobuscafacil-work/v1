import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProductStatus, OrderStatus, SupplierStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getSupplierStats(supplierId: string) {
    const [totalProducts, totalServices, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      this.prisma.product.count({ where: { supplierId, status: ProductStatus.ACTIVE } }),
      this.prisma.service.count({ where: { supplierId, status: ProductStatus.ACTIVE } }),
      this.prisma.order.count({ where: { supplierId } }),
      this.prisma.order.aggregate({
        where: { supplierId, status: OrderStatus.DELIVERED },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        where: { supplierId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, total: true, status: true, createdAt: true },
      }),
    ]);

    return {
      totalProducts,
      totalServices,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
    };
  }

  async getSupplierSalesByPeriod(supplierId: string, startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        supplierId,
        createdAt: { gte: startDate, lte: endDate },
        status: { in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED] },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((sum, o) => Number(sum) + Number(o.total), 0);

    return {
      period: { startDate, endDate },
      totalSales: orders.length,
      totalRevenue,
      orders,
    };
  }

  async getSupplierTopProducts(supplierId: string, limit = 10) {
    const products = await this.prisma.product.findMany({
      where: { supplierId, status: ProductStatus.ACTIVE },
      select: { id: true, name: true, saleCount: true, price: true },
    });

    return products
      .map(p => ({ id: p.id, name: p.name, totalSold: p.saleCount, totalRevenue: Number(p.price) * p.saleCount }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  }

  async getAdminStats() {
    const [totalUsers, totalSuppliers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.supplierProfile.count({ where: { status: SupplierStatus.APPROVED } }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED },
        _sum: { total: true },
      }),
    ]);

    return {
      totalUsers,
      totalSuppliers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }
}
