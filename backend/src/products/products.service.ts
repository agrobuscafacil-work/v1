import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    const product = await this.prisma.product.create({
      data: {
        supplierId: supplier.id,
        name: dto.name,
        slug: dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        comparePrice: dto.comparePrice,
        stock: dto.stock || 0,
        categoryId: dto.categoryId,
        brand: dto.brand,
        images: dto.images || [],
        tags: dto.tags || [],
        specifications: dto.specifications || {},
        unit: dto.unit || 'un',
        status: ProductStatus.ACTIVE,
      },
      include: { category: true, supplier: true },
    });

    this.logger.log(`Product created: ${product.id}`);
    return product;
  }

  async findAll(params: {
    page?: number; limit?: number; categoryId?: string; supplierId?: string;
    search?: string; minPrice?: number; maxPrice?: number; status?: string;
  }) {
    const { page = 1, limit = 10, categoryId, supplierId, search, minPrice, maxPrice, status } = params;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          supplier: { select: { id: true, companyName: true, logoUrl: true, rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        supplier: {
          include: {
            user: { select: { id: true, name: true } },
            reviews: { take: 5, orderBy: { createdAt: 'desc' }, select: { rating: true, comment: true } },
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as ProductStatus,
      },
      include: { category: true, supplier: true },
    });
    return product;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductStatus.DISCONTINUED },
    });
    this.logger.log(`Product soft deleted: ${id}`);
    return { message: 'Product deleted successfully' };
  }
}
