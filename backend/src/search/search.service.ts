import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  async search(params: {
    q?: string; categoryId?: string; supplierId?: string;
    minPrice?: number; maxPrice?: number; city?: string; state?: string;
    page?: number; limit?: number; sort?: string;
  }) {
    const { q, categoryId, supplierId, minPrice, maxPrice, city, state, page = 1, limit = 20, sort } = params;
    const skip = (page - 1) * limit;

    const productWhere: any = { deletedAt: null };
    const supplierWhere: any = {};

    if (q) {
      productWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
      supplierWhere.OR = [
        { companyName: { contains: q, mode: 'insensitive' } },
        { tradingName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (categoryId) productWhere.categoryId = categoryId;
    if (supplierId) productWhere.supplierId = supplierId;
    if (minPrice || maxPrice) {
      productWhere.price = {};
      if (minPrice) productWhere.price.gte = minPrice;
      if (maxPrice) productWhere.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'best_sellers') orderBy = { saleCount: 'desc' };

    const [products, productCount, suppliers, supplierCount] = await Promise.all([
      this.prisma.product.findMany({
        where: productWhere, skip, take: limit, orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          supplier: { select: { id: true, companyName: true, logoUrl: true, rating: true } },
        },
      }),
      this.prisma.product.count({ where: productWhere }),
      this.prisma.supplierProfile.findMany({
        where: { ...supplierWhere, status: 'APPROVED' },
        take: 5,
      }),
      this.prisma.supplierProfile.count({ where: { ...supplierWhere, status: 'APPROVED' } }),
    ]);

    return {
      products: { data: products, meta: { total: productCount, page, limit, totalPages: Math.ceil(productCount / limit) } },
      suppliers: { data: suppliers, total: supplierCount },
    };
  }

  async searchSuggestions(q: string) {
    const [products, categories, suppliers] = await Promise.all([
      this.prisma.product.findMany({
        where: { name: { contains: q, mode: 'insensitive' }, deletedAt: null },
        take: 5,
        select: { id: true, name: true, slug: true, price: true, images: true },
      }),
      this.prisma.category.findMany({
        where: { name: { contains: q, mode: 'insensitive' }, active: true },
        take: 5,
        select: { id: true, name: true, slug: true },
      }),
      this.prisma.supplierProfile.findMany({
        where: { companyName: { contains: q, mode: 'insensitive' } },
        take: 3,
        select: { id: true, companyName: true, logoUrl: true },
      }),
    ]);

    return { products, categories, suppliers };
  }
}
