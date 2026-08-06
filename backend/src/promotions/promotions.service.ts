import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

const promotionInclude = {
  product: { select: { id: true, name: true, images: true, price: true } },
} as const;

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private prisma: PrismaService) {}

  private isAdmin(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private async getSupplierId(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return supplier.id;
  }

  async create(user: { id: string; role?: string }, dto: CreatePromotionDto) {
    const supplierId = await this.getSupplierId(user.id);
    const promotion = await this.prisma.promotion.create({
      data: {
        supplierId,
        title: dto.title,
        description: dto.description,
        discountType: dto.discountType || 'PERCENTAGE',
        discountValue: dto.discountValue,
        minQuantity: dto.minQuantity,
        maxQuantity: dto.maxQuantity,
        productId: dto.productId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        active: dto.active ?? true,
      },
      include: promotionInclude,
    });
    this.logger.log(`Promotion created: ${promotion.id}`);
    return promotion;
  }

  async findAllPublic(params: { supplierId?: string }) {
    const now = new Date();
    const where: any = { active: true, startDate: { lte: now }, endDate: { gte: now } };
    if (params.supplierId) where.supplierId = params.supplierId;
    return this.prisma.promotion.findMany({
      where,
      include: promotionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMine(userId: string) {
    const supplierId = await this.getSupplierId(userId);
    return this.prisma.promotion.findMany({
      where: { supplierId },
      include: promotionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(user: { id: string; role?: string }, id: string, dto: UpdatePromotionDto) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { supplier: { select: { userId: true } } },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (!this.isAdmin(user.role) && promotion.supplier?.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para editar esta promoção');
    }

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: promotionInclude,
    });
  }

  async remove(user: { id: string; role?: string }, id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { supplier: { select: { userId: true } } },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (!this.isAdmin(user.role) && promotion.supplier?.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para excluir esta promoção');
    }
    await this.prisma.promotion.delete({ where: { id } });
    this.logger.log(`Promotion deleted: ${id}`);
    return { message: 'Promotion deleted successfully' };
  }
}
