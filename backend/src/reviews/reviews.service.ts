import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewStatus } from '../generated/prisma/client';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findFirst({
      where: {
        userId,
        ...(dto.productId
          ? { productId: dto.productId }
          : { serviceId: dto.serviceId }),
      },
    });

    if (existing) {
      const target = dto.productId ? 'produto' : 'serviço';
      throw new ConflictException(
        `Você já avaliou este ${target}. Para alterar sua avaliação, clique em "Editar avaliação".`,
      );
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        supplierId: dto.supplierId,
        productId: dto.productId || null,
        serviceId: dto.serviceId || null,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        images: dto.images || [],
        status: ReviewStatus.APPROVED,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await this.refreshRatings(review.productId, review.supplierId);

    this.logger.log(`Review created: ${review.id}`);
    return review;
  }

  private async refreshRatings(productId: string | null, supplierId: string) {
    if (productId) {
      const productAgg = await this.prisma.review.aggregate({
        where: { productId, status: ReviewStatus.APPROVED },
        _avg: { rating: true },
        _count: { id: true },
      });
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          rating: productAgg._avg.rating ?? 0,
          totalReviews: productAgg._count.id,
        },
      });
    }

    const supplierAgg = await this.prisma.review.aggregate({
      where: { supplierId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { id: true },
    });
    await this.prisma.supplierProfile.update({
      where: { id: supplierId },
      data: {
        rating: supplierAgg._avg.rating ?? 0,
        totalReviews: supplierAgg._count.id,
      },
    });
  }

  async findAll(params: {
    page?: number; limit?: number; supplierId?: string; productId?: string; serviceId?: string; status?: string;
  }) {
    const { page: rawPage = 1, limit: rawLimit = 10, supplierId, productId, serviceId, status } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (productId) where.productId = productId;
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where, skip, take: limit,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          product: { select: { id: true, name: true, slug: true, images: true } },
          service: { select: { id: true, name: true } },
          supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        reviewResponses: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({ where: { id, userId } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: { ...dto },
    });
  }

  async moderate(id: string, dto: ModerateReviewDto) {
    await this.findById(id);
    const review = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status as ReviewStatus, moderatorId: dto.moderatorId, moderatedAt: new Date() },
    });
    await this.refreshRatings(review.productId, review.supplierId);
    return review;
  }

  async remove(id: string, user: { id: string; role: string }) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    let review;
    if (isAdmin) {
      review = await this.prisma.review.findUnique({ where: { id } });
    } else if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!supplier) throw new NotFoundException('Supplier profile not found');
      review = await this.prisma.review.findFirst({
        where: { id, supplierId: supplier.id },
      });
    } else {
      review = await this.prisma.review.findFirst({ where: { id, userId: user.id } });
    }

    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id } });
    await this.refreshRatings(review.productId, review.supplierId);
    return { message: 'Review deleted successfully' };
  }
}
