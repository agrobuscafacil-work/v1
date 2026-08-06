import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private prisma: PrismaService) {}

  private isAdmin(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  async getConfig(supplierId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      select: { deliveryInfo: true },
    });
    return supplier?.deliveryInfo || null;
  }

  async updateConfig(supplierId: string, deliveryInfo: any, user: { id: string; role: string }) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      select: { id: true, userId: true },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (!this.isAdmin(user.role) && supplier.userId !== user.id) {
      throw new ForbiddenException('You cannot update this supplier shipping config');
    }
    const updated = await this.prisma.supplierProfile.update({
      where: { id: supplierId },
      data: { deliveryInfo },
      select: { deliveryInfo: true },
    });
    return updated.deliveryInfo;
  }

  async calculateCost(supplierId: string, dto: { zipCode: string; weight?: number; subtotal: number }) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      select: { deliveryInfo: true },
    });

    const config = supplier?.deliveryInfo as any;
    if (!config || !config.methods) return [];

    return config.methods.map((method: any) => {
      let cost = method.baseCost || 0;
      if (method.freeShippingMin && dto.subtotal >= method.freeShippingMin) cost = 0;
      else if (dto.weight && method.costPerKg) cost += dto.weight * method.costPerKg;
      return { method: method.name, cost: Math.max(cost, 0), estimatedDays: method.estimatedDays || 0 };
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isMain: 'desc' },
    });
  }

  async addAddress(userId: string, dto: any) {
    if (dto.isMain) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isMain: false },
      });
    }
    return this.prisma.address.create({
      data: {
        userId,
        zipCode: dto.zipCode,
        street: dto.street,
        number: dto.number,
        complement: dto.complement,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'Brasil',
        isMain: !!dto.isMain,
        label: dto.label,
      },
    });
  }

  async removeAddress(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Address deleted' };
  }
}
