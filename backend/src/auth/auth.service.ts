import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenStore = new Map<string, { token: string; exp: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        document: dto.document,
        phone: dto.phone,
        role: dto.role || 'CUSTOMER',
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

    const tokens = await this.generateTokens(user);

    this.logger.log(`New user registered: ${user.email} (${user.role})`);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
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

    const tokens = await this.generateTokens(user);

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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedToken = this.refreshTokenStore.get(payload.jti);

      if (!storedToken || storedToken.token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > storedToken.exp) {
        this.refreshTokenStore.delete(payload.jti);
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      this.refreshTokenStore.delete(payload.jti);

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    for (const [key, value] of this.refreshTokenStore.entries()) {
      try {
        const payload = this.jwtService.decode(value.token) as any;
        if (payload && payload.sub === userId) {
          this.refreshTokenStore.delete(key);
        }
      } catch {}
    }

    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
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
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
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

    this.refreshTokenStore.set(jti, {
      token: refreshToken,
      exp: expDate,
    });

    return { accessToken, refreshToken };
  }
}
