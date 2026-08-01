import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private prisma: PrismaService) {}

  async getConfig(supplierId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      select: { deliveryInfo: true },
    });
    return supplier?.deliveryInfo || null;
  }

  async updateConfig(supplierId: string, deliveryInfo: any) {
    const supplier = await this.prisma.supplierProfile.update({
      where: { id: supplierId },
      data: { deliveryInfo },
    });
    return supplier.deliveryInfo;
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
    return this.prisma.address.create({ data: { userId, ...dto } });
  }

  async removeAddress(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Address deleted' };
  }
}
