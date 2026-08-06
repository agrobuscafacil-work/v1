import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private prisma: PrismaService) {}

  async add(userId: string, dto: AddFavoriteDto) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, productId: dto.productId, supplierId: dto.supplierId },
    });

    if (existing) throw new ConflictException('Already in favorites');

    const favorite = await this.prisma.favorite.create({
      data: { userId, ...dto },
    });
    this.logger.log(`Favorite added: ${favorite.id}`);
    return favorite;
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    page = parsePage(page);
    limit = parseLimit(limit, 20);
    const skip = (page - 1) * limit;
    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where, skip, take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true, price: true, images: true, rating: true, totalReviews: true, stock: true, status: true } },
          supplier: { select: { id: true, companyName: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async remove(id: string, userId: string) {
    const favorite = await this.prisma.favorite.findFirst({ where: { id, userId } });
    if (!favorite) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({ where: { id } });
    return { message: 'Removed from favorites' };
  }

  async isFavorited(userId: string, productId?: string, supplierId?: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, productId, supplierId },
    });
    return { isFavorited: !!favorite };
  }
}
