import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ProductStatus } from '../generated/prisma/client';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private prisma: PrismaService) {}

  private isAdmin(role?: string) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private async assertOwner(serviceId: string, user: { id: string; role: string }) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { supplier: { select: { userId: true } } },
    });
    if (!service) throw new NotFoundException('Service not found');
    if (!this.isAdmin(user.role) && service.supplier?.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this service');
    }
  }

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
    const { page: rawPage = 1, limit: rawLimit = 10, categoryId, supplierId, search, status } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
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

  async update(id: string, dto: UpdateServiceDto, user: { id: string; role: string }) {
    await this.assertOwner(id, user);
    return this.prisma.service.update({
      where: { id },
      data: { ...dto, status: dto.status as ProductStatus },
      include: { category: true, supplier: true },
    });
  }

  async remove(id: string, user: { id: string; role: string }) {
    await this.assertOwner(id, user);
    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductStatus.DISCONTINUED },
    });
    this.logger.log(`Service soft deleted: ${id}`);
    return { message: 'Service deleted successfully' };
  }
}
