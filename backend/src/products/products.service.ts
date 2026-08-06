import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '../generated/prisma/client';
import { PRODUCT_UPLOAD_PATH } from './products-upload.constants';
import { parsePage, parseLimit } from '../common/utils/pagination';

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
    search?: string; minPrice?: number; maxPrice?: number; status?: string; featured?: boolean;
  }) {
    const { page: rawPage = 1, limit: rawLimit = 10, categoryId, supplierId, search, minPrice, maxPrice, status, featured } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (status && status !== 'ALL') {
      where.status = status;
    } else if (!status) {
      where.status = ProductStatus.ACTIVE;
    }
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (featured) where.featured = true;
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

  async findMine(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
    });
    if (!supplier) {
      return { data: [], meta: { total: 0 } };
    }

    const data = await this.prisma.product.findMany({
      where: { supplierId: supplier.id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        supplier: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data, meta: { total: data.length } };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, status: ProductStatus.ACTIVE },
      include: {
        category: true,
        supplier: {
          select: {
            id: true,
            companyName: true,
            tradingName: true,
            logoUrl: true,
            rating: true,
            totalReviews: true,
            totalProducts: true,
            phone: true,
            whatsapp: true,
            addresses: {
              select: { city: true, state: true },
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(user: { id: string; role?: string }, id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { supplier: { select: { userId: true } } },
    });
    if (!existing) throw new NotFoundException('Product not found');
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && existing.supplier.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para editar este produto');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as ProductStatus,
      },
      include: { category: true, supplier: true },
    });

    if (dto.images) {
      const removed = (existing.images || []).filter(
        (img) => !dto.images!.includes(img),
      );
      this.deleteImageFiles(removed);
    }

    return product;
  }

  async remove(user: { id: string; role?: string }, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { supplier: { select: { userId: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && product.supplier.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para excluir este produto');
    }

    this.deleteImageFiles(product.images || []);

    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (err: any) {
      if (err?.code === 'P2003') {
        await this.prisma.cartItem.deleteMany({ where: { productId: id } });
        await this.prisma.favorite.deleteMany({ where: { productId: id } });
        await this.prisma.review.deleteMany({ where: { productId: id } });
        await this.prisma.promotion.deleteMany({ where: { productId: id } });
        await this.prisma.coupon.deleteMany({ where: { productId: id } });
        try {
          await this.prisma.product.delete({ where: { id } });
        } catch {
          throw new BadRequestException(
            'Este produto possui pedidos registrados e não pode ser excluído.',
          );
        }
      } else {
        throw err;
      }
    }

    this.logger.log(`Product deleted: ${id}`);
    return { message: 'Product deleted successfully' };
  }

  private deleteImageFiles(images: string[]) {
    for (const img of images) {
      try {
        const filename = path.basename(img);
        const filePath = path.join(PRODUCT_UPLOAD_PATH, filename);
        if (existsSync(filePath)) unlinkSync(filePath);
      } catch (err) {
        this.logger.warn(`Falha ao remover arquivo de imagem: ${img} - ${err}`);
      }
    }
  }
}
