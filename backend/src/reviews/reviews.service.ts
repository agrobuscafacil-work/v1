import { Injectable, NotFoundException, ConflictException, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, CreateSellerReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { SellerReviewResponseDto } from './dto/seller-review-response.dto';
import { CreateReviewReportDto, ReviewReportStatus } from './dto/review-report.dto';
import { ReviewStatus } from '../generated/prisma/client';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  constructor(private prisma: PrismaService) {}

  private async getOwnSupplierId(userId: string): Promise<string | null> {
    const sp = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    return sp?.id ?? null;
  }

  async create(userId: string, dto: CreateReviewDto) {
    // Fluxo novo via orderItemId (avaliação pela página de pedidos após confirmação)
    let productId: string | null = (dto as any).productId ?? null;
    let serviceId: string | null = (dto as any).serviceId ?? null;
    let supplierId: string | undefined = (dto as any).supplierId;
    let orderId: string | null = null;
    let verifiedPurchase = false;

    if ((dto as any).orderItemId) {
      const oi = await this.prisma.orderItem.findUnique({ where: { id: (dto as any).orderItemId }, include: { product: true, order: true } });
      if (!oi) throw new NotFoundException('Item do pedido não encontrado');
      if (oi.order.customerId !== userId) throw new ForbiddenException('Você não tem permissão para avaliar este item');
      if (oi.order.status !== 'DELIVERED' || !oi.confirmedDeliveryAt) throw new ForbiddenException('Avaliação só permitida após confirmação de recebimento.');
      const existing2 = await this.prisma.review.findFirst({ where: { userId, productId: oi.productId } });
      if (existing2) throw new ConflictException('Você já avaliou este produto. Para alterar, vá na página do produto e clique em Editar.');
      productId = oi.productId;
      supplierId = oi.product.supplierId;
      orderId = oi.orderId;
      verifiedPurchase = true;
    } else {
      const existing = await this.prisma.review.findFirst({
        where: { userId, ...(productId ? { productId } : { serviceId } ) },
      });
      if (existing) {
        const target = productId ? 'produto' : 'serviço';
        throw new ConflictException(`Você já avaliou este ${target}. Para alterar sua avaliação, clique em "Editar avaliação" na página do produto.`);
      }
      if (productId) {
        const orderItem = await this.prisma.orderItem.findFirst({
          where: { productId, order: { customerId: userId, status: 'DELIVERED' }, confirmedDeliveryAt: { not: null } },
          select: { id: true },
        });
        if (!orderItem) throw new ForbiddenException('Avaliação só permitida após confirmação de recebimento do produto. Confirme o recebimento na página do pedido antes de avaliar.');
        verifiedPurchase = true;
      }
      if (!supplierId) throw new BadRequestException('Fornecedor não informado');
    }
    // Bloqueia auto-avaliação: fornecedor não pode avaliar seus próprios produtos/serviços
    const ownSupplierIdForProduct = await this.getOwnSupplierId(userId);
    if (ownSupplierIdForProduct && supplierId === ownSupplierIdForProduct) {
      throw new ForbiddenException('Fornecedores não podem avaliar os próprios produtos ou serviços.');
    }
    if (ownSupplierIdForProduct && productId) {
      const prodCheck = await this.prisma.product.findUnique({ where: { id: productId }, select: { supplierId: true } });
      if (prodCheck && prodCheck.supplierId === ownSupplierIdForProduct) {
        throw new ForbiddenException('Fornecedores não podem avaliar os próprios produtos.');
      }
    }
    if (ownSupplierIdForProduct && serviceId) {
      const servCheck = await this.prisma.service.findUnique({ where: { id: serviceId }, select: { supplierId: true } });
      if (servCheck && servCheck.supplierId === ownSupplierIdForProduct) {
        throw new ForbiddenException('Fornecedores não podem avaliar os próprios serviços.');
      }
    }
    const review = await this.prisma.review.create({
      data: { userId, supplierId, productId, serviceId, orderId, rating: dto.rating, title: dto.title ?? null, comment: dto.comment ?? null, images: dto.images ?? [], status: ReviewStatus.APPROVED, verifiedPurchase } as any,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    await this.refreshRatings(review.productId, review.supplierId);
    this.logger.log(`Review created: ${review.id}`);
    return review;
  }

  async createSellerReview(userId: string, dto: CreateSellerReviewDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId }, include: { items: { include: { product: true } } } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== userId) throw new ForbiddenException('You do not have permission to review this order');
    if (order.status !== 'DELIVERED') throw new BadRequestException('Seller review only allowed for delivered orders');
    const supplierIds = [...new Set(order.items.map(i => i.product.supplierId))];
    if (supplierIds.length !== 1) throw new BadRequestException('Não é possível determinar o vendedor único para este pedido');
    const supplierId = supplierIds[0];
    const ownSupplierIdForSeller = await this.getOwnSupplierId(userId);
    if (ownSupplierIdForSeller && supplierId === ownSupplierIdForSeller) {
      throw new ForbiddenException('Você não pode avaliar seu próprio perfil de fornecedor.');
    }
    const existing = await this.prisma.sellerReview.findFirst({ where: { userId, supplierId } });
    if (existing) throw new ConflictException('Você já avaliou este fornecedor. Cada usuário pode avaliar um fornecedor apenas uma vez. Para alterar, edite sua avaliação existente.');
    const sellerReview = await this.prisma.sellerReview.create({
      data: { userId, supplierId, orderId: dto.orderId, rating: dto.rating, title: dto.title, comment: dto.comment, images: dto.images || [], status: ReviewStatus.APPROVED, verifiedPurchase: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    await this.refreshSellerRating(supplierId);
    this.logger.log(`SellerReview created: ${sellerReview.id}`);
    return sellerReview;
  }

  private async refreshRatings(productId: string | null, supplierId: string) {
    if (productId) {
      const productAgg = await this.prisma.review.aggregate({ where: { productId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { id: true } });
      await this.prisma.product.update({ where: { id: productId }, data: { rating: productAgg._avg.rating ?? 0, totalReviews: productAgg._count.id } });
    }
    const supplierAgg = await this.prisma.review.aggregate({ where: { supplierId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { id: true } });
    await this.prisma.supplierProfile.update({ where: { id: supplierId }, data: { rating: supplierAgg._avg.rating ?? 0, totalReviews: supplierAgg._count.id } });
  }

  private async refreshSellerRating(supplierId: string) {
    const sellerAgg = await this.prisma.sellerReview.aggregate({ where: { supplierId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { id: true } });
    await this.prisma.supplierProfile.update({ where: { id: supplierId }, data: { sellerRating: sellerAgg._avg.rating ?? 0, sellerTotalReviews: sellerAgg._count.id } });
  }

  async findAll(params: { page?: number; limit?: number; supplierId?: string; productId?: string; serviceId?: string; status?: string }) {
    const { page: rawPage = 1, limit: rawLimit = 10, supplierId, productId, serviceId, status } = params;
    const page = parsePage(rawPage); const limit = parseLimit(rawLimit); const skip = (page - 1) * limit;
    const where: any = {}; if (supplierId) where.supplierId = supplierId; if (productId) where.productId = productId; if (serviceId) where.serviceId = serviceId; if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({ where, skip, take: limit, include: { user: { select: { id: true, name: true, avatarUrl: true } }, product: { select: { id: true, name: true, slug: true, images: true } }, service: { select: { id: true, name: true } }, supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.review.count({ where }),
    ]);
    const dataWithVerified = await Promise.all(data.map(async r => {
      let verifiedPurchase = (r as any).verifiedPurchase ?? false;
      if (!verifiedPurchase && r.productId) {
        const oi = await this.prisma.orderItem.findFirst({ where: { productId: r.productId, order: { customerId: r.userId, status: 'DELIVERED' }, confirmedDeliveryAt: { not: null } }, select: { id: true } });
        verifiedPurchase = !!oi;
      }
      return { ...r, verifiedPurchase };
    }));
    return { data: dataWithVerified, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findSellerReviews(params: { page?: number; limit?: number; supplierId?: string; status?: string }) {
    const { page: rawPage = 1, limit: rawLimit = 10, supplierId, status } = params;
    const page = parsePage(rawPage); const limit = parseLimit(rawLimit); const skip = (page - 1) * limit;
    const where: any = {}; if (supplierId) where.supplierId = supplierId; if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.sellerReview.findMany({ where, skip, take: limit, include: { user: { select: { id: true, name: true, avatarUrl: true } }, order: { select: { id: true, orderNumber: true, createdAt: true } }, supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } }, sellerResponses: { include: { user: { select: { id: true, name: true } } } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.sellerReview.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getProductReviewsSummary(productId: string) {
    const [agg, distribution] = await Promise.all([
      this.prisma.review.aggregate({ where: { productId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { id: true } }),
      this.prisma.review.groupBy({ by: ['rating'], where: { productId, status: ReviewStatus.APPROVED }, _count: { rating: true }, orderBy: { rating: 'desc' } }),
    ]);
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d: any) => { dist[d.rating] = d._count.rating; });
    return { averageRating: Number(agg._avg.rating?.toFixed(2) ?? 0), totalReviews: agg._count.id, distribution: dist };
  }

  async getSellerReviewsSummary(supplierId: string) {
    const [agg, distribution] = await Promise.all([
      this.prisma.sellerReview.aggregate({ where: { supplierId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { id: true } }),
      this.prisma.sellerReview.groupBy({ by: ['rating'], where: { supplierId, status: ReviewStatus.APPROVED }, _count: { rating: true }, orderBy: { rating: 'desc' } }),
    ]);
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d: any) => { dist[d.rating] = d._count.rating; });
    return { averageRating: Number(agg._avg.rating?.toFixed(2) ?? 0), totalReviews: agg._count.id, distribution: dist };
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, avatarUrl: true } }, reviewResponses: { include: { user: { select: { id: true, name: true } } } } } });
    if (!review) throw new NotFoundException('Review not found');
    let verifiedPurchase = (review as any).verifiedPurchase ?? false;
    if (!verifiedPurchase && review.productId) {
      const oi = await this.prisma.orderItem.findFirst({ where: { productId: review.productId, order: { customerId: review.userId, status: 'DELIVERED' }, confirmedDeliveryAt: { not: null } }, select: { id: true } });
      verifiedPurchase = !!oi;
    }
    return { ...review, verifiedPurchase };
  }

  async findSellerReviewById(id: string) {
    const review = await this.prisma.sellerReview.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, avatarUrl: true } }, sellerResponses: { include: { user: { select: { id: true, name: true } } } }, order: { select: { id: true, orderNumber: true } }, supplier: { select: { id: true, companyName: true, tradingName: true } } } });
    if (!review) throw new NotFoundException('SellerReview not found');
    return review;
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({ where: { id, userId } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: { ...dto } });
  }

  async updateSellerReview(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.sellerReview.findFirst({ where: { id, userId } });
    if (!review) throw new NotFoundException('SellerReview not found');
    return this.prisma.sellerReview.update({ where: { id }, data: { ...dto }, include: { user: { select: { id: true, name: true, avatarUrl: true } } } });
  }

  async moderate(id: string, dto: ModerateReviewDto) {
    await this.findById(id);
    const review = await this.prisma.review.update({ where: { id }, data: { status: dto.status as ReviewStatus, moderatorId: dto.moderatorId, moderatedAt: new Date() } });
    await this.refreshRatings(review.productId, review.supplierId);
    return review;
  }

  async moderateSellerReview(id: string, dto: ModerateReviewDto) {
    await this.findSellerReviewById(id);
    const review = await this.prisma.sellerReview.update({ where: { id }, data: { status: dto.status as ReviewStatus, moderatorId: dto.moderatorId, moderatedAt: new Date() } });
    await this.refreshSellerRating(review.supplierId);
    return review;
  }

  async addProductResponse(reviewId: string, userId: string, dto: SellerReviewResponseDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId }, include: { product: true } });
    if (!review) throw new NotFoundException('Review not found');
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier || supplier.id !== review.supplierId) throw new ForbiddenException('Only the related supplier can respond to this review');
    return this.prisma.reviewResponse.create({ data: { reviewId, userId, supplierId: supplier.id, comment: dto.comment }, include: { user: { select: { id: true, name: true } } } });
  }

  async addResponse(reviewId: string, userId: string, dto: SellerReviewResponseDto) {
    const review = await this.prisma.sellerReview.findUnique({ where: { id: reviewId }, include: { supplier: true } });
    if (!review) throw new NotFoundException('SellerReview not found');
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier || supplier.id !== review.supplierId) throw new ForbiddenException('Only the related supplier can respond to this review');
    return this.prisma.sellerReviewResponse.create({ data: { sellerReviewId: reviewId, userId, supplierId: supplier.id, comment: dto.comment }, include: { user: { select: { id: true, name: true } } } });
  }

  async report(reviewId: string, userId: string, dto: CreateReviewReportDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    const existing = await this.prisma.reviewReport.findFirst({ where: { reviewId, reportedBy: userId } });
    if (existing) throw new ConflictException('You have already reported this review');
    return this.prisma.reviewReport.create({ data: { reviewId, reportedBy: userId, reason: dto.reason, description: dto.description } });
  }

  async reportSellerReview(sellerReviewId: string, userId: string, dto: CreateReviewReportDto) {
    const review = await this.prisma.sellerReview.findUnique({ where: { id: sellerReviewId } });
    if (!review) throw new NotFoundException('SellerReview not found');
    const existing = await this.prisma.sellerReviewReport.findFirst({ where: { sellerReviewId, reportedBy: userId } });
    if (existing) throw new ConflictException('You have already reported this review');
    return this.prisma.sellerReviewReport.create({ data: { sellerReviewId, reportedBy: userId, reason: dto.reason, description: dto.description } });
  }

  async moderateReport(reportId: string, dto: { status: ReviewReportStatus }, moderatorId: string) {
    const report = await this.prisma.reviewReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.reviewReport.update({ where: { id: reportId }, data: { status: dto.status, resolvedBy: moderatorId, resolvedAt: new Date() } });
  }

  async moderateSellerReport(reportId: string, dto: { status: ReviewReportStatus }, moderatorId: string) {
    const report = await this.prisma.sellerReviewReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('SellerReviewReport not found');
    return this.prisma.sellerReviewReport.update({ where: { id: reportId }, data: { status: dto.status, resolvedBy: moderatorId, resolvedAt: new Date() } });
  }

  async getUserEligibleItems(userId: string) {
    const ownSupplierId = await this.getOwnSupplierId(userId);
    const deliveredItems = await this.prisma.orderItem.findMany({
      where: { order: { customerId: userId, status: 'DELIVERED', confirmedDeliveryAt: { not: null } } },
      include: { product: { select: { id: true, name: true, slug: true, images: true, supplierId: true } }, order: { select: { id: true, orderNumber: true, status: true, deliveredAt: true } } },
      orderBy: { order: { deliveredAt: 'desc' } },
    });
    const reviewed = await this.prisma.review.findMany({ where: { userId, productId: { not: null } }, select: { productId: true } });
    const reviewedSet = new Set(reviewed.map(r => r.productId).filter(Boolean) as string[]);
    return deliveredItems
      .filter(item => !reviewedSet.has(item.product.id))
      .filter(item => !ownSupplierId || item.product.supplierId !== ownSupplierId)
      .map(item => ({ orderItemId: item.id, orderId: item.orderId, orderNumber: item.order.orderNumber, deliveredAt: item.order.deliveredAt, product: item.product }));
  }

  async getUserEligibleSellerOrders(userId: string) {
    const ownSupplierId = await this.getOwnSupplierId(userId);
    const deliveredOrders = await this.prisma.order.findMany({
      where: { customerId: userId, status: 'DELIVERED', confirmedDeliveryAt: { not: null } },
      include: { items: { include: { product: { select: { supplierId: true } } } } },
      orderBy: { deliveredAt: 'desc' },
    });
    const reviewed = await this.prisma.sellerReview.findMany({ where: { userId }, select: { supplierId: true } });
    const reviewedSet = new Set(reviewed.map((r) => r.supplierId));

    return deliveredOrders
      .filter((order) => {
        const supplierIds = [...new Set(order.items.map((i) => i.product.supplierId))];
        if (supplierIds.length !== 1) return false;
        if (ownSupplierId && supplierIds[0] === ownSupplierId) return false;
        return !reviewedSet.has(supplierIds[0]);
      })
      .map((order) => {
        const supplierIds = [...new Set(order.items.map((i) => i.product.supplierId))];
        return { orderId: order.id, orderNumber: order.orderNumber, deliveredAt: order.deliveredAt, supplierId: supplierIds[0], multiSupplier: supplierIds.length > 1 };
      });
  }

  async getReviewStats(supplierId: string) {
    const [productStats, sellerStats] = await Promise.all([this.getProductReviewsSummaryForSupplier(supplierId), this.getSellerReviewsSummary(supplierId)]);
    return { product: productStats, seller: sellerStats };
  }

  private async getProductReviewsSummaryForSupplier(supplierId: string) {
    const [agg, distribution] = await Promise.all([
      this.prisma.review.aggregate({ where: { supplierId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { id: true } }),
      this.prisma.review.groupBy({ by: ['rating'], where: { supplierId, status: ReviewStatus.APPROVED }, _count: { rating: true }, orderBy: { rating: 'desc' } }),
    ]);
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d: any) => { dist[d.rating] = d._count.rating; });
    return { averageRating: Number(agg._avg.rating?.toFixed(2) ?? 0), totalReviews: agg._count.id, distribution: dist };
  }

  async remove(id: string, user: { id: string; role: string }) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    let review;
    if (isAdmin) review = await this.prisma.review.findUnique({ where: { id } });
    else if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
      if (!supplier) throw new NotFoundException('Supplier profile not found');
      review = await this.prisma.review.findFirst({ where: { id, supplierId: supplier.id } });
    } else review = await this.prisma.review.findFirst({ where: { id, userId: user.id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.prisma.review.delete({ where: { id } });
    await this.refreshRatings(review.productId, review.supplierId);
    return { message: 'Review deleted successfully' };
  }

  async removeSellerReview(id: string, user: { id: string; role: string }) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    let review;
    if (isAdmin) review = await this.prisma.sellerReview.findUnique({ where: { id } });
    else if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
      if (!supplier) throw new NotFoundException('Supplier profile not found');
      review = await this.prisma.sellerReview.findFirst({ where: { id, supplierId: supplier.id } });
    } else review = await this.prisma.sellerReview.findFirst({ where: { id, userId: user.id } });
    if (!review) throw new NotFoundException('SellerReview not found');
    await this.prisma.sellerReview.delete({ where: { id } });
    await this.refreshSellerRating(review.supplierId);
    return { message: 'SellerReview deleted successfully' };
  }
}
