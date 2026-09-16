import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  adminId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldData?: any;
  newData?: any;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: data.adminId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          oldValue: data.oldData,
          newValue: data.newData,
          ipAddress: data.ip,
          userAgent: data.userAgent,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log audit: ${error.message}`, error.stack);
    }
  }

  async logUserCreate(adminId: string, userId: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'USER_CREATE',
      resourceType: 'User',
      resourceId: userId,
      ip,
      userAgent,
    });
  }

  async logUserUpdate(adminId: string, userId: string, oldData: any, newData: any, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'USER_UPDATE',
      resourceType: 'User',
      resourceId: userId,
      oldData,
      newData,
      ip,
      userAgent,
    });
  }

  async logUserDelete(adminId: string, userId: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'USER_DELETE',
      resourceType: 'User',
      resourceId: userId,
      ip,
      userAgent,
    });
  }

  async logSupplierCreate(adminId: string, supplierId: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'SUPPLIER_CREATE',
      resourceType: 'Supplier',
      resourceId: supplierId,
      ip,
      userAgent,
    });
  }

  async logSupplierUpdate(adminId: string, supplierId: string, oldData: any, newData: any, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'SUPPLIER_UPDATE',
      resourceType: 'Supplier',
      resourceId: supplierId,
      oldData,
      newData,
      ip,
      userAgent,
    });
  }

  async logSupplierDelete(adminId: string, supplierId: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'SUPPLIER_DELETE',
      resourceType: 'Supplier',
      resourceId: supplierId,
      ip,
      userAgent,
    });
  }

  async logProductCreate(adminId: string, productId: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'PRODUCT_CREATE',
      resourceType: 'Product',
      resourceId: productId,
      ip,
      userAgent,
    });
  }

  async logProductUpdate(adminId: string, productId: string, oldData: any, newData: any, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'PRODUCT_UPDATE',
      resourceType: 'Product',
      resourceId: productId,
      oldData,
      newData,
      ip,
      userAgent,
    });
  }

  async logProductDelete(adminId: string, productId: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'PRODUCT_DELETE',
      resourceType: 'Product',
      resourceId: productId,
      ip,
      userAgent,
    });
  }

  async logOrderStatusChange(adminId: string, orderId: string, oldStatus: string, newStatus: string, ip?: string, userAgent?: string) {
    await this.log({
      adminId,
      action: 'ORDER_STATUS_CHANGE',
      resourceType: 'Order',
      resourceId: orderId,
      oldData: { status: oldStatus },
      newData: { status: newStatus },
      ip,
      userAgent,
    });
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 20, adminId, action, resourceType, startDate, endDate } = params;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}