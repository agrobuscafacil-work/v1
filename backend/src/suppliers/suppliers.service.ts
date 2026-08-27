import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierStoreAddressDto } from './dto/supplier-store-address.dto';
import { SupplierWorkingHourDto } from './dto/supplier-working-hours.dto';
import { SupplierApprovalDto } from './dto/supplier-approval.dto';
import { SupplierStatus } from '../generated/prisma/client';
import { Prisma } from '../generated/prisma/client';
import { parsePage, parseLimit } from '../common/utils/pagination';

const publicSupplierSelect: Prisma.SupplierProfileSelect = {
  id: true,
  companyName: true,
  tradingName: true,
  description: true,
  logoUrl: true,
  bannerUrl: true,
  website: true,
  email: true,
  phone: true,
  rating: true,
  totalReviews: true,
  sellerRating: true,
  sellerTotalReviews: true,
  totalProducts: true,
  certifications: true,
  badges: true,
  featured: true,
  foundedYear: true,
  businessHours: true,
  deliveryInfo: true,
  socialNetworks: true,
  createdAt: true,
  status: true,
  foundationHistory: {
    select: { foundationDate: true },
    orderBy: { recordedAt: 'asc' },
    take: 1,
  },
  addresses: {
    select: { id: true, zipCode: true, street: true, number: true, complement: true, neighborhood: true, city: true, state: true, country: true, latitude: true, longitude: true, isMain: true },
    where: { isMain: true },
    take: 1,
  },
  workingHours: {
    select: { dayOfWeek: true, openTime: true, closeTime: true, isOpen: true },
    orderBy: { dayOfWeek: 'asc' },
  },
  _count: { select: { products: { where: { status: 'ACTIVE', deletedAt: null } } } },
  chatSettings: {
    select: { online: true, autoReply: true, autoReplyMessage: true, welcomeMessage: true },
  },
};

const adminSupplierSelect: Prisma.SupplierProfileSelect = {
  ...publicSupplierSelect,
  userId: true,
  email: true,
  phone: true,
  whatsapp: true,
  approvedAt: true,
  user: { select: { name: true, email: true, phone: true, active: true } },
};

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSupplierDto) {
    const existing = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('User already has a supplier profile');
    }

    const supplier = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supplierProfile.create({ data: { userId, ...dto } });
      await tx.supplierFoundationHistory.create({ data: { supplierId: created.id, foundationDate: created.createdAt } });
      return created;
    });

    this.logger.log(`Supplier profile created: ${supplier.id}`);
    return supplier;
  }

  async findAll(params: { page?: number; limit?: number; status?: SupplierStatus; search?: string }) {
    const { page: rawPage = 1, limit: rawLimit = 10, status, search } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { tradingName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplierProfile.findMany({
        where,
        select: publicSupplierSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplierProfile.count({ where }),
    ]);

    return { data: data.map(({ _count, foundationHistory, ...supplier }) => ({ ...supplier, foundationDate: foundationHistory[0]?.foundationDate ?? null, totalProducts: _count.products })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findAllAdmin(params: { page?: number; limit?: number; status?: SupplierStatus; search?: string }) {
    const { page: rawPage = 1, limit: rawLimit = 10, status, search } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { tradingName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplierProfile.findMany({
        where,
        select: adminSupplierSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplierProfile.count({ where }),
    ]);

    return { data: data.map(({ _count, foundationHistory, ...supplier }) => ({ ...supplier, foundationDate: foundationHistory[0]?.foundationDate ?? null, totalProducts: _count.products })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id },
      select: {
        ...publicSupplierSelect,
        whatsapp: true,
        user: { select: { id: true, name: true } },
      },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    const { _count, workingHours, foundationHistory, ...publicSupplier } = supplier;
    const businessHours = workingHours.length > 0
      ? workingHours.map((hour) => ({ day: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][hour.dayOfWeek], openTime: hour.openTime, closeTime: hour.closeTime, hours: hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : 'Fechado' }))
      : publicSupplier.businessHours;
    return { ...publicSupplier, businessHours, foundationDate: foundationHistory[0]?.foundationDate ?? null, totalProducts: _count.products };
  }

  async findByUserId(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      include: { addresses: { where: { isMain: true }, take: 1 } },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return supplier;
  }

  async getStoreAddress(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return this.prisma.address.findFirst({ where: { supplierId: supplier.id, isMain: true } });
  }

  async updateLogo(userId: string, logoUrl: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return this.prisma.supplierProfile.update({ where: { id: supplier.id }, data: { logoUrl }, select: { id: true, logoUrl: true } });
  }

  async updateStoreAddress(userId: string, dto: SupplierStoreAddressDto) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.address.findFirst({ where: { supplierId: supplier.id, isMain: true }, select: { id: true } });
      await tx.address.updateMany({ where: { supplierId: supplier.id }, data: { isMain: false } });
      const data = {
        supplierId: supplier.id,
        zipCode: dto.zipCode.replace(/\D/g, ''),
        street: dto.street.trim(),
        number: dto.number.trim(),
        complement: dto.complement?.trim() || null,
        neighborhood: dto.neighborhood.trim(),
        city: dto.city.trim(),
        state: dto.state.trim().toUpperCase(),
        country: dto.country?.trim() || 'Brasil',
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        isMain: true,
      };
      if (current) return tx.address.update({ where: { id: current.id }, data });
      return tx.address.create({ data });
    });
  }

  async getWorkingHours(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return this.prisma.workingHours.findMany({ where: { supplierId: supplier.id }, orderBy: { dayOfWeek: 'asc' } });
  }

  async updateWorkingHours(userId: string, hours: SupplierWorkingHourDto[]) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    const days = new Set(hours.map((hour) => hour.dayOfWeek));
    if (days.size !== hours.length) throw new BadRequestException('Cada dia da semana deve aparecer apenas uma vez');
    for (const hour of hours) {
      if (hour.isOpen && (!hour.openTime || !hour.closeTime)) throw new BadRequestException('Informe os horários de abertura e fechamento para os dias abertos');
      if (hour.isOpen && hour.openTime! >= hour.closeTime!) throw new BadRequestException('O horário de fechamento deve ser posterior ao horário de abertura');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.workingHours.deleteMany({ where: { supplierId: supplier.id } });
      if (hours.length) {
        await tx.workingHours.createMany({ data: hours.map((hour) => ({ supplierId: supplier.id, dayOfWeek: hour.dayOfWeek, openTime: hour.openTime || '', closeTime: hour.closeTime || '', isOpen: hour.isOpen })) });
      }
      return tx.workingHours.findMany({ where: { supplierId: supplier.id }, orderBy: { dayOfWeek: 'asc' } });
    });
  }

  async update(id: string, dto: UpdateSupplierDto, user: { id: string; role: string }) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && supplier.userId !== user.id) {
      throw new ForbiddenException('You cannot update this supplier profile');
    }
    return this.prisma.supplierProfile.update({ where: { id }, data: dto });
  }

  async approve(id: string, dto: SupplierApprovalDto) {
    await this.findById(id);
    const status = dto.approved ? SupplierStatus.APPROVED : SupplierStatus.REJECTED;
    const supplier = await this.prisma.supplierProfile.update({
      where: { id },
      data: { status, approvedAt: dto.approved ? new Date() : null },
    });
    this.logger.log(`Supplier ${id} approval status: ${status}`);
    return supplier;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.supplierProfile.update({
      where: { id },
      data: { status: SupplierStatus.BLOCKED, deletedAt: new Date() },
    });
    this.logger.log(`Supplier soft deleted: ${id}`);
    return { message: 'Supplier deleted successfully' };
  }
}
