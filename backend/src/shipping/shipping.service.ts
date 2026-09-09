import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface Coordinates { latitude: number; longitude: number }

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly coordinatesCache = new Map<string, { value: Coordinates; expiresAt: number }>();

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
    const productIds = (dto as any).productIds as string[] | undefined;
    if (productIds?.length) {
      return this.calculateProductShipping(supplierId, dto.zipCode, productIds);
    }
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

  async calculateProductShipping(supplierId: string, customerZipCode: string, productIds: string[]) {
    const cleanZip = this.normalizeZip(customerZipCode);
    const supplierAddress = await this.prisma.address.findFirst({
      where: { supplierId },
      orderBy: { isMain: 'desc' },
      select: { zipCode: true, latitude: true, longitude: true },
    });
    if (!supplierAddress) throw new NotFoundException('Supplier address not found');

    const [origin, destination, products] = await Promise.all([
      supplierAddress.latitude != null && supplierAddress.longitude != null
        ? Promise.resolve({ latitude: Number(supplierAddress.latitude), longitude: Number(supplierAddress.longitude) })
        : this.coordinatesForZip(supplierAddress.zipCode),
      this.coordinatesForZip(cleanZip),
      this.prisma.product.findMany({
        where: { id: { in: productIds }, supplierId, deletedAt: null },
        select: { id: true, shippingBaseCost: true, shippingAdditionalCost: true, shippingFreeDistanceKm: true },
      }),
    ]);

    if (products.length !== new Set(productIds).size) throw new NotFoundException('Product not found for supplier');
    const distanceKm = this.distanceInKm(origin, destination);
    const breakdown = products.map((product) => {
      const base = Math.max(Number(product.shippingBaseCost), 0);
      const additional = distanceKm > Number(product.shippingFreeDistanceKm) ? Math.max(Number(product.shippingAdditionalCost), 0) : 0;
      return { productId: product.id, baseCost: base, additionalCost: additional, total: base + additional };
    });
    const shippingCost = breakdown.reduce((sum, item) => sum + item.total, 0);
    return { shippingCost, distanceKm: Number(distanceKm.toFixed(2)), breakdown };
  }

  private normalizeZip(zipCode: string) {
    const clean = String(zipCode || '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(clean)) throw new NotFoundException('Invalid ZIP code');
    return clean;
  }

  private async coordinatesForZip(zipCode: string): Promise<Coordinates> {
    const cleanZip = this.normalizeZip(zipCode);
    const cached = this.coordinatesCache.get(cleanZip);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    let value: Coordinates | null = null;

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanZip}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json() as any;
        const latitude = Number(data?.location?.coordinates?.latitude);
        const longitude = Number(data?.location?.coordinates?.longitude);
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) value = { latitude, longitude };
      }
    } catch (error) {
      this.logger.warn(`BrasilAPI indisponível para o CEP ${cleanZip}: ${String(error)}`);
    }

    if (!value) {
      try {
        const query = new URLSearchParams({ format: 'jsonv2', postalcode: cleanZip, country: 'Brazil' });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'AgroBuscaFacil/2.0 (freight-calculation)',
          },
          signal: AbortSignal.timeout(7000),
        });
        if (response.ok) {
          const results = await response.json() as Array<{ lat?: string; lon?: string }>;
          const latitude = Number(results[0]?.lat);
          const longitude = Number(results[0]?.lon);
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) value = { latitude, longitude };
        }
      } catch (error) {
        this.logger.warn(`OpenStreetMap indisponível para o CEP ${cleanZip}: ${String(error)}`);
      }
    }

    if (!value) throw new NotFoundException(`Could not locate ZIP code ${cleanZip}`);
    this.coordinatesCache.set(cleanZip, { value, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return value;
  }

  private distanceInKm(origin: Coordinates, destination: Coordinates) {
    const radians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = radians(destination.latitude - origin.latitude);
    const deltaLon = radians(destination.longitude - origin.longitude);
    const a = Math.sin(deltaLat / 2) ** 2
      + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) * Math.sin(deltaLon / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
