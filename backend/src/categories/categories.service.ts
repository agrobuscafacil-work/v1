import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Category slug already exists');

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const category = await this.prisma.category.create({ data: dto });
    this.logger.log(`Category created: ${category.id}`);
    return category;
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { active: true },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async findTree() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null, active: true },
      include: {
        children: {
          include: {
            children: { include: { children: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    if (dto.slug) {
      const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) throw new ConflictException('Slug already in use');
    }
    return this.prisma.category.update({ where: { id }, data: dto, include: { parent: true, children: true } });
  }

  async remove(id: string) {
    await this.findById(id);
    const childrenCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }
    await this.prisma.category.update({ where: { id }, data: { active: false } });
    this.logger.log(`Category deactivated: ${id}`);
    return { message: 'Category deactivated successfully' };
  }
}
