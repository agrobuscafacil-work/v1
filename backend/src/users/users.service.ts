import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { parsePage, parseLimit } from '../common/utils/pagination';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { page: rawPage = 1, limit: rawLimit = 10, role, search } = params;
    const page = parsePage(rawPage);
    const limit = parseLimit(rawLimit);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          document: true,
          phone: true,
          avatarUrl: true,
          role: true,
          active: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        document: true,
        phone: true,
        avatarUrl: true,
        role: true,
        active: true,
        verified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        document: true,
        phone: true,
        avatarUrl: true,
        role: true,
        active: true,
        verified: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateByAdmin(id: string, dto: UpdateUserAdminDto) {
    await this.findById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        document: true,
        phone: true,
        avatarUrl: true,
        role: true,
        active: true,
        verified: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const isSameAsCurrent = await bcrypt.compare(
      dto.newPassword,
      user.password,
    );

    if (isSameAsCurrent) {
      throw new BadRequestException('A nova senha não pode ser igual à senha atual');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS')) || 12;
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

async remove(id: string) {
    await this.findById(id);

    await this.prisma.user.update({
      where: { id },
      data: { active: false, deletedAt: new Date() },
    });

    this.logger.log(`User soft deleted: ${id}`);
    return { message: 'Account deleted successfully' };
  }

  async createByAdmin(dto: CreateUserAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const existingDoc = await this.prisma.user.findUnique({
      where: { document: dto.document },
    });
    if (existingDoc) {
      throw new ConflictException('Document already registered');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS')) || 12;
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        document: dto.document,
        phone: dto.phone,
        role: dto.role,
        active: dto.active ?? true,
        verified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        document: true,
        phone: true,
        role: true,
        active: true,
        verified: true,
        createdAt: true,
      },
    });

this.logger.log(`User created by admin: ${user.email}`);
    return user;
  }
}
