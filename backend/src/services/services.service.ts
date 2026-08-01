import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateServiceDto) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    const service = await this.prisma.service.create({
      data: {
        supplierId: supplier.id,
        name: dto.name,
        slug: dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        description: dto.description || '',
        price: dto.price,
        categoryId: dto.categoryId,
        duration: dto.duration,
        durationUnit: dto.durationUnit || 'hours',
        images: dto.images || [],
        tags: dto.tags || [],
        status: ProductStatus.ACTIVE,
      },
      include: { category: true, supplier: true },
    });

    this.logger.log(`Service created: ${service.id}`);
    return service;
  }

  async findAll(params: {
    page?: number; limit?: number; categoryId?: string; supplierId?: string; search?: string; status?: string;
  }) {
    const { page = 1, limit = 10, categoryId, supplierId, search, status } = params;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where, skip, take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          supplier: { select: { id: true, companyName: true, logoUrl: true, rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.service.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);
    return this.prisma.service.update({
      where: { id },
      data: { ...dto, status: dto.status as ProductStatus },
      include: { category: true, supplier: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductStatus.DISCONTINUED },
    });
    this.logger.log(`Service soft deleted: ${id}`);
    return { message: 'Service deleted successfully' };
  }
}
