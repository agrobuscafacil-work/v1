import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../common/mail/mail.service';
import Redis from 'ioredis';

interface TokenMeta {
  ip?: string;
  userAgent?: string;
}

interface StoredRefreshToken {
  token: string;
  exp: Date;
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
    private mailService: MailService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async register(dto: RegisterDto, meta?: TokenMeta) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const existingDocument = await this.prisma.user.findUnique({
      where: { document: dto.document },
    });

    if (existingUser || existingDocument) {
      throw new ConflictException('E-mail ou documento já cadastrado');
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
        const supplierProfile = await tx.supplierProfile.create({
          data: {
            userId: createdUser.id,
            companyName: dto.name,
            document: dto.document,
            phone: dto.phone || '',
            email: dto.email,
          },
        });
        await tx.supplierFoundationHistory.create({
          data: { supplierId: supplierProfile.id, foundationDate: createdUser.createdAt },
        });
        this.logger.log(`Supplier profile auto-created for: ${createdUser.email}`);
      }

      return createdUser;
    });

    let supplierId: string | undefined;
    if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      supplierId = supplier?.id;
    }

    const tokens = await this.generateTokens({ ...user, supplierId }, meta);

    this.logger.log(`New user registered: ${user.email} (${user.role})`);

    return { user, ...tokens };
  }

  async login(dto: LoginDto, meta?: TokenMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos. Verifique os dados informados e tente novamente.');
    }

    if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({
        where: { userId: user.id },
        select: { status: true },
      });
      if (supplier?.status === 'BLOCKED') {
        throw new UnauthorizedException(
          'Sua conta foi bloqueada, entre em contato conosco para obter mais informações.',
        );
      }
      if (supplier?.status === 'REJECTED') {
        throw new UnauthorizedException(
          'Sua conta foi rejeitada, entre em contato conosco para obter mais informações.',
        );
      }
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is inactive. Contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos. Verifique os dados informados e tente novamente.');
    }

    let supplierId: string | undefined;
    if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      supplierId = supplier?.id;
    }

    const tokens = await this.generateTokens({ ...user, supplierId }, meta);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string, meta?: TokenMeta) {
    let payload: { jti?: string; sub?: string; supplierId?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.redis.get(`refresh_token:${payload.jti}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    await this.redis.del(`refresh_token:${payload.jti}`);

    const tokens = await this.generateTokens({ ...user, supplierId: payload.supplierId }, meta);
    return {
      user: this.toPublicUser(user),
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
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        if (payload.jti) {
          await this.redis.del(`refresh_token:${payload.jti}`);
        }
      } catch {
        // If we can't decode the token, try to find it by scanning
        const keys = await this.redis.keys('refresh_token:*');
        for (const key of keys) {
          const stored = await this.redis.get(key);
          if (stored === refreshToken) {
            await this.redis.del(key);
            break;
          }
        }
      }
    } else {
      // Delete all refresh tokens for this user
      const keys = await this.redis.keys('refresh_token:*');
      for (const key of keys) {
        const stored = await this.redis.get(key);
        if (stored === refreshToken) {
          await this.redis.del(key);
          break;
        }
      }
    }
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async logoutByToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.jti) {
        await this.redis.del(`refresh_token:${payload.jti}`);
      }
    } catch {
      // If we can't decode the token, try to find it by scanning
      const keys = await this.redis.keys('refresh_token:*');
      for (const key of keys) {
        const stored = await this.redis.get(key);
        if (stored === refreshToken) {
          await this.redis.del(key);
          break;
        }
      }
    }
    this.logger.log('Refresh token revoked on logout');
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    user: { id: string; email: string; role: string; supplierId?: string },
    meta?: TokenMeta,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      supplierId: user.supplierId,
    };

    const accessToken = this.jwtService.sign(payload);

    const jti = randomBytes(16).toString('hex');
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

    // Store refresh token in Redis with TTL
    const ttlSeconds = Math.floor((expDate.getTime() - Date.now()) / 1000);
    await this.redis.set(`refresh_token:${jti}`, refreshToken, 'EX', ttlSeconds);

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string | null;
    document: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    verified: boolean;
    active: boolean;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      document: user.document,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      verified: user.verified,
      active: user.active,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.' };
    }

    const resetToken = randomBytes(16).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: createHash('sha256').update(resetToken).digest('hex'),
        resetPasswordExpires: resetExpires,
      },
    });

    const resetUrl = `${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}/auth/reset-password`;
    const sent = await this.mailService.sendPasswordResetEmail(user.email, user.name || 'Usuário', resetToken, resetUrl);
    if (!sent) {
      throw new BadRequestException('Falha ao enviar e-mail. Verifique a configuração SMTP do servidor.');
    }

    this.logger.log(`Password reset email sent to: ${user.email}`);
    return { message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado. Solicite uma nova redefinição de senha.');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS')) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    this.logger.log(`Password reset for user: ${user.email}`);
    return { message: 'Senha redefinida com sucesso. Faça login com sua nova senha.' };
  }

  async confirmEmail(token: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        emailConfirmationToken: hashedToken,
        emailConfirmationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token de confirmação inválido ou expirado. Solicite um novo e-mail de confirmação.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        emailConfirmationToken: null,
        emailConfirmationExpires: null,
      },
    });

    await this.mailService.sendWelcomeEmail(user.email, user.name || 'Usuário');

    this.logger.log(`Email confirmed for user: ${user.email}`);
    return { message: 'E-mail confirmado com sucesso! Sua conta está ativa.' };
  }

  async resendConfirmation(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, você receberá um novo e-mail de confirmação.' };
    }

    if (user.verified) {
      throw new BadRequestException('Este e-mail já foi confirmado. Faça login para acessar sua conta.');
    }

    const confirmationToken = randomBytes(16).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmationToken: createHash('sha256').update(confirmationToken).digest('hex'),
        emailConfirmationExpires: confirmationExpires,
      },
    });

    const confirmUrl = `${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}/auth/confirm-email`;
    const sent = await this.mailService.sendEmailConfirmation(user.email, user.name || 'Usuário', confirmationToken, confirmUrl);
    if (!sent) {
      throw new BadRequestException('Falha ao enviar e-mail. Verifique a configuração SMTP do servidor.');
    }

    this.logger.log(`Confirmation email resent to: ${user.email}`);
    return { message: 'Se o e-mail estiver cadastrado, você receberá um novo e-mail de confirmação.' };
  }

  async resendWelcomeEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    let sent: boolean;
    if (user.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } });
      sent = await this.mailService.sendSupplierWelcomeEmail(user.email, user.name || 'Usuário', supplier?.companyName || 'Sua Empresa');
    } else {
      sent = await this.mailService.sendWelcomeEmail(user.email, user.name || 'Usuário');
    }
    if (!sent) {
      throw new BadRequestException('Falha ao enviar e-mail. Verifique a configuração SMTP do servidor.');
    }

    this.logger.log(`Welcome email resent to: ${user.email}`);
    return { message: 'E-mail de boas-vindas reenviado com sucesso.' };
  }

  async sendAdminPasswordResetEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const resetToken = randomBytes(16).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: createHash('sha256').update(resetToken).digest('hex'),
        resetPasswordExpires: resetExpires,
      },
    });

    const resetUrl = `${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}/auth/reset-password`;
    const sent = await this.mailService.sendAdminPasswordResetEmail(user.email, user.name || 'Usuário', resetToken, resetUrl);
    if (!sent) {
      throw new BadRequestException('Falha ao enviar e-mail. Verifique a configuração SMTP do servidor.');
    }

    this.logger.log(`Admin password reset email sent to: ${user.email}`);
    return { message: 'E-mail de redefinição de senha enviado com sucesso.' };
  }
}