import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierApprovalDto } from './dto/supplier-approval.dto';
import { SupplierStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSupplierDto) {
    const existing = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('User already has a supplier profile');
    }

    const supplier = await this.prisma.supplierProfile.create({
      data: { userId, ...dto },
    });

    this.logger.log(`Supplier profile created: ${supplier.id}`);
    return supplier;
  }

  async findAll(params: { page?: number; limit?: number; status?: SupplierStatus; search?: string }) {
    const { page = 1, limit = 10, status, search } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { tradingName: { contains: search, mode: 'insensitive' } },
        { document: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplierProfile.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.supplierProfile.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async findByUserId(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findById(id);
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
