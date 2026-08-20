import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

interface TokenMeta {
  ip?: string;
  userAgent?: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, meta?: TokenMeta) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const existingDocument = await this.prisma.user.findUnique({
      where: { document: dto.document },
    });

    if (existingDocument) {
      throw new ConflictException('Document already registered');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS')) || 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          document: dto.document,
          phone: dto.phone,
          role: dto.role === 'SUPPLIER' ? 'SUPPLIER' : 'CUSTOMER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          document: true,
          phone: true,
          createdAt: true,
        },
      });

      if (createdUser.role === 'SUPPLIER') {
        await tx.supplierProfile.create({
          data: {
            userId: createdUser.id,
            companyName: dto.name,
            document: dto.document,
            phone: dto.phone || '',
            email: dto.email,
          },
        });
        this.logger.log(`Supplier profile auto-created for: ${createdUser.email}`);
      }

      return createdUser;
    });

    const tokens = await this.generateTokens(user, meta);

    this.logger.log(`New user registered: ${user.email} (${user.role})`);

    return { user, ...tokens };
  }

  async login(dto: LoginDto, meta?: TokenMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is inactive. Contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user, meta);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string, meta?: TokenMeta) {
    let payload: { jti?: string; sub?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.tokenHash !== hashToken(refreshToken)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub || storedToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date(), usedAt: new Date() },
    });

    const tokens = await this.generateTokens(user, meta);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      ...tokens,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        verified: true,
        active: true,
        document: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async logout(userId: string, refreshToken?: string) {
    const query: any = { revokedAt: null };
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        query.jti = payload.jti;
      } catch {
        query.userId = userId;
      }
    } else {
      query.userId = userId;
    }
    await this.prisma.refreshToken.updateMany({
      where: query,
      data: { revokedAt: new Date() },
    });
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async logoutByToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      await this.prisma.refreshToken.updateMany({
        where: { jti: payload.jti },
        data: { revokedAt: new Date() },
      });
      this.logger.log('Refresh token revoked on logout');
    } catch {}
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    user: { id: string; email: string; role: string },
    meta?: TokenMeta,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const jti = uuidv4();
    const refreshToken = this.jwtService.sign(
      { ...payload, jti },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
      },
    );

    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const expDate = new Date();
    const match = refreshExpiresIn.match(/^(\d+)([dhms])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'd': expDate.setDate(expDate.getDate() + value); break;
        case 'h': expDate.setHours(expDate.getHours() + value); break;
        case 'm': expDate.setMinutes(expDate.getMinutes() + value); break;
        case 's': expDate.setSeconds(expDate.getSeconds() + value); break;
      }
    }

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        jti,
        tokenHash: hashToken(refreshToken),
        expiresAt: expDate,
        userAgent: meta?.userAgent || null,
        ip: meta?.ip || null,
      },
    });

    return { accessToken, refreshToken };
  }
}