import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
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
        status: ReviewStatus.PENDING,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    this.logger.log(`Review created: ${review.id}`);
    return review;
  }

  async findAll(params: {
    page?: number; limit?: number; supplierId?: string; productId?: string; serviceId?: string; status?: string;
  }) {
    const { page = 1, limit = 10, supplierId, productId, serviceId, status } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (productId) where.productId = productId;
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where, skip, take: limit,
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
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
    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status as ReviewStatus, moderatorId: dto.moderatorId, moderatedAt: new Date() },
    });
  }

  async remove(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const review = await this.prisma.review.findFirst({ where });
    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id } });
    return { message: 'Review deleted successfully' };
  }
}
