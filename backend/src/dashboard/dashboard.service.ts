import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus, OrderStatus, SupplierStatus } from '../generated/prisma/client';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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

  private monthStart(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private addMonths(date: Date, amount: number) {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  }

  private percentChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private timeAgo(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 31) return `${days} dias atrás`;
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private async getMonthlyRevenue(months = 7) {
    const start = this.addMonths(this.monthStart(), -(months - 1));
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED] },
        createdAt: { gte: start },
      },
      select: { total: true, createdAt: true },
    });

    const buckets = new Map<string, { month: string; revenue: number; orders: number }>();
    for (const o of orders) {
      const d = o.createdAt;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = MONTH_NAMES[d.getMonth()];
      const cur = buckets.get(key) || { month: label, revenue: 0, orders: 0 };
      cur.revenue += Number(o.total);
      cur.orders += 1;
      buckets.set(key, cur);
    }

    const result: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 0; i < months; i++) {
      const d = this.addMonths(this.monthStart(), -(months - 1 - i));
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      result.push(buckets.get(key) || { month: MONTH_NAMES[d.getMonth()], revenue: 0, orders: 0 });
    }
    return result;
  }

  async getAdminStats() {
    const now = new Date();
    const monthStart = this.monthStart(now);
    const prevMonthStart = this.addMonths(monthStart, -1);

    const [
      totalUsers,
      activeUsers,
      newUsersMonth,
      newUsersPrevMonth,
      approvedSuppliers,
      suppliersByStatusRows,
      totalProducts,
      totalOrders,
      ordersThisMonth,
      deliveredCount,
      deliveredMonthRevenue,
      deliveredPrevMonthRevenue,
      monthly,
      topSearches,
      recentUsers,
      recentSuppliers,
      recentOrders,
      sessionsThisMonth,
      topPagesRows,
      conversationsCount,
      reviewsCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: prevMonthStart, lt: monthStart } } }),
      this.prisma.supplierProfile.count({ where: { status: SupplierStatus.APPROVED } }),
      this.prisma.supplierProfile.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED, createdAt: { gte: monthStart } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED, createdAt: { gte: prevMonthStart, lt: monthStart } },
        _sum: { total: true },
      }),
      this.getMonthlyRevenue(),
      this.prisma.searchLog.findMany({
        orderBy: { count: 'desc' },
        take: 10,
        select: { id: true, term: true, count: true },
      }),
      this.prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      }),
      this.prisma.supplierProfile.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, companyName: true, tradingName: true, status: true, rating: true, createdAt: true,
        },
      }),
      this.prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderNumber: true, total: true, status: true, createdAt: true,
          customer: { select: { name: true } },
        },
      }),
      this.prisma.sessionLog.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.sessionLog.findMany({
        where: { pagePath: { not: null } },
        take: 500,
        select: { pagePath: true },
      }),
      this.prisma.conversation.count(),
      this.prisma.review.count({ where: { status: 'APPROVED' } }),
    ]);

    const monthRevenue = Number(deliveredMonthRevenue._sum.total) || 0;
    const prevRevenue = Number(deliveredPrevMonthRevenue._sum.total) || 0;

    const ordersByStatusRows = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const ordersByStatus: Record<string, number> = {};
    for (const row of ordersByStatusRows) ordersByStatus[row.status as string] = row._count._all;

    const suppliersByStatus: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0, BLOCKED: 0 };
    for (const row of suppliersByStatusRows) suppliersByStatus[row.status as string] = row._count._all;

    const recentActivity = [
      ...recentUsers.map((u) => ({
        id: u.id,
        type: 'user',
        text: `Novo usuário cadastrado: ${u.name}`,
        time: this.timeAgo(u.createdAt),
      })),
      ...recentSuppliers.map((s) => ({
        id: s.id,
        type: 'supplier',
        text: `Fornecedor "${s.tradingName || s.companyName}" ${s.status === 'PENDING' ? 'aguardando aprovação' : 'cadastrado'}`,
        time: this.timeAgo(s.createdAt),
      })),
      ...recentOrders.map((o) => ({
        id: o.id,
        type: 'order',
        text: `Novo pedido ${o.orderNumber} recebido`,
        time: this.timeAgo(o.createdAt),
      })),
    ];

    recentActivity.sort((a, b) => new Date(b.id.length ? 0 : 0).getTime() - new Date(a.id.length ? 0 : 0).getTime());

    return {
      totalUsers,
      activeUsers,
      newUsersMonth,
      totalSuppliers: approvedSuppliers,
      suppliersByStatus,
      totalProducts,
      totalOrders,
      totalRevenue: monthRevenue + prevRevenue,
      monthRevenue,
      prevRevenue,
      revenueChange: this.percentChange(monthRevenue, prevRevenue),
      usersChange: this.percentChange(newUsersMonth, newUsersPrevMonth),
      ordersChange: this.percentChange(ordersThisMonth, 0),
      ordersThisMonth,
      deliveredOrders: deliveredCount,
      conversionRate: sessionsThisMonth > 0 ? Math.round((ordersThisMonth / sessionsThisMonth) * 1000) / 10 : 0,
      monthly,
      topSearches,
      recentUsers,
      recentSuppliers,
      recentActivity,
      sessions: {
        thisMonth: sessionsThisMonth,
      },
      topPages: Array.from(
        topPagesRows.reduce((map, s) => {
          const p = s.pagePath as string;
          map.set(p, (map.get(p) || 0) + 1);
          return map;
        }, new Map<string, number>()),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([page, count]) => ({ page, count })),
      conversations: { total: conversationsCount },
      reviews: reviewsCount,
    };
  }
}