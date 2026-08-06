import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierStatus, ReviewStatus } from '../generated/prisma/client';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const [
      totalUsers, totalSuppliers, totalProducts, totalServices,
      totalOrders, totalRevenue, pendingSuppliers, pendingReviews,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.supplierProfile.count(),
      this.prisma.product.count(),
      this.prisma.service.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { total: true } }),
      this.prisma.supplierProfile.count({ where: { status: SupplierStatus.PENDING } }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
    ]);

    return {
      totalUsers, totalSuppliers, totalProducts, totalServices,
      totalOrders, totalRevenue: totalRevenue._sum.total || 0,
      pendingSuppliers, pendingReviews,
    };
  }

  async getAuditLogs(page = 1, limit = 20) {
    page = parsePage(page, 1);
    limit = parseLimit(limit, 20);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async manageUserStatus(userId: string, active: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { active },
      select: { id: true, email: true, name: true, active: true },
    });
    this.logger.log(`User ${userId} status set to ${active}`);
    return user;
  }

  async getPendingApprovals() {
    const [suppliers, reviews] = await Promise.all([
      this.prisma.supplierProfile.findMany({
        where: { status: SupplierStatus.PENDING },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.review.findMany({
        where: { status: ReviewStatus.PENDING },
        include: { user: { select: { id: true, name: true } } },
        take: 20,
      }),
    ]);
    return { suppliers, reviews };
  }

  async getSettings() {
    const rows = await this.prisma.systemSetting.findMany();
    const settings: Record<string, any> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  async updateSettings(userId: string, dto: { settings: Record<string, any> }) {
    const entries = dto.settings || {};
    await Promise.all(
      Object.keys(entries).map((key) =>
        this.prisma.systemSetting.upsert({
          where: { key },
          create: { key, value: entries[key], updatedBy: userId },
          update: { value: entries[key], updatedBy: userId },
        }),
      ),
    );
    this.logger.log(`Settings updated by ${userId}`);
    return this.getSettings();
  }
}
