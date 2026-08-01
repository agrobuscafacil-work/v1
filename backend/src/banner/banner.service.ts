import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBannerDto) {
    const banner = await this.prisma.banner.create({ data: dto });
    this.logger.log(`Banner created: ${banner.id}`);
    return banner;
  }

  async findAll(activeOnly = false) {
    const where: any = {};
    if (activeOnly) where.active = true;

    return this.prisma.banner.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.findById(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.banner.delete({ where: { id } });
    this.logger.log(`Banner deleted: ${id}`);
    return { message: 'Banner deleted successfully' };
  }
}
