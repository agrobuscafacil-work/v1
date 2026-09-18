import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';
import { UpdateEmailSettingsDto } from '../admin/dto/email-settings.dto';
import { UpdatePaymentSettingsDto } from '../admin/dto/payment-settings.dto';

const EMAIL_KEYS = [
  'email.smtpHost',
  'email.smtpPort',
  'email.smtpUser',
  'email.smtpPass',
  'email.smtpFrom',
  'email.smtpSecure',
] as const;

const PAYMENT_KEYS = [
  'payments.gateway',
  'payments.creditCardEnabled',
  'payments.pixEnabled',
  'payments.boletoEnabled',
  'payments.maxInstallments',
  'payments.minInstallmentAmount',
  'payments.stripePublishableKey',
] as const;

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  private async readKeys(keys: readonly string[]): Promise<Record<string, any>> {
    const rows = await this.prisma.systemSetting.findMany({
      where: { key: { in: [...keys] } },
    });
    const out: Record<string, any> = {};
    for (const row of rows) out[row.key] = row.value;
    return out;
  }

  // ---------------- Email ----------------

  async getEmailSettings() {
    const db = await this.readKeys(EMAIL_KEYS);
    const host = db['email.smtpHost'] ?? this.configService.get<string>('SMTP_HOST') ?? '';
    const port = Number(db['email.smtpPort'] ?? this.configService.get('SMTP_PORT') ?? 587);
    const user = db['email.smtpUser'] ?? this.configService.get<string>('SMTP_USER') ?? '';
    const from = db['email.smtpFrom'] ?? this.configService.get<string>('SMTP_FROM') ?? '';
    const secure = db['email.smtpSecure'] ?? (port === 465 ? 'ssl' : 'tls');
    const passwordConfigured = Boolean(
      db['email.smtpPass'] || this.configService.get<string>('SMTP_PASS'),
    );
    return {
      smtpHost: host,
      smtpPort: port,
      smtpUser: user,
      smtpFrom: from,
      smtpSecure: secure,
      passwordConfigured,
      source: {
        smtpHost: db['email.smtpHost'] !== undefined ? 'database' : 'env',
        smtpPort: db['email.smtpPort'] !== undefined ? 'database' : 'env',
        smtpUser: db['email.smtpUser'] !== undefined ? 'database' : 'env',
        smtpFrom: db['email.smtpFrom'] !== undefined ? 'database' : 'env',
        smtpSecure: db['email.smtpSecure'] !== undefined ? 'database' : 'env',
        smtpPass: db['email.smtpPass'] !== undefined ? 'database' : 'env',
      },
    };
  }

  async updateEmailSettings(adminId: string, dto: UpdateEmailSettingsDto) {
    const mapping: Record<string, any> = {
      smtpHost: dto.smtpHost,
      smtpPort: dto.smtpPort,
      smtpUser: dto.smtpUser,
      smtpFrom: dto.smtpFrom,
      smtpSecure: dto.smtpSecure,
    };
    // Senha é write-only: só grava se foi informada
    if (dto.smtpPass !== undefined && dto.smtpPass !== '') {
      mapping.smtpPass = dto.smtpPass;
    }
    const entries = Object.entries(mapping).filter(([, v]) => v !== undefined);
    await Promise.all(
      entries.map(([field, value]) =>
        this.prisma.systemSetting.upsert({
          where: { key: `email.${field}` },
          create: { key: `email.${field}`, value, updatedBy: adminId },
          update: { value, updatedBy: adminId },
        }),
      ),
    );
    this.logger.log(`Email settings updated by ${adminId}`);
    await this.mailService.refreshFromDatabase();
    return this.getEmailSettings();
  }

  async testEmailSettings(to: string) {
    const ok = await this.mailService.sendEmail({
      to,
      subject: 'E-mail de teste - AgroBuscaFácil',
      html: '<p>Este é um e-mail de teste das configurações de SMTP do AgroBuscaFácil. Se você recebeu, está tudo funcionando.</p>',
      text: 'E-mail de teste do AgroBuscaFácil. Se você recebeu, está tudo funcionando.',
    });
    if (!ok) {
      throw new BadRequestException(
        'Falha ao enviar e-mail de teste. Verifique host, porta, usuário e senha SMTP nos logs do servidor.',
      );
    }
    return { message: `E-mail de teste enviado para ${to}` };
  }

  // ---------------- Payments ----------------

  async getPaymentSettings() {
    const db = await this.readKeys(PAYMENT_KEYS);
    return {
      gateway: db['payments.gateway'] ?? 'stripe',
      creditCardEnabled: db['payments.creditCardEnabled'] ?? true,
      pixEnabled: db['payments.pixEnabled'] ?? true,
      boletoEnabled: db['payments.boletoEnabled'] ?? true,
      maxInstallments: Number(db['payments.maxInstallments'] ?? 12),
      minInstallmentAmount: Number(db['payments.minInstallmentAmount'] ?? 100),
      stripePublishableKey: db['payments.stripePublishableKey'] ?? '',
      providers: {
        stripeConfigured: Boolean(this.configService.get<string>('STRIPE_SECRET_KEY')),
        mercadopagoEnabled: this.configService.get<string>('MP_ENABLED') === 'true',
      },
    };
  }

  async updatePaymentSettings(adminId: string, dto: UpdatePaymentSettingsDto) {
    const mapping: Record<string, any> = {
      gateway: dto.gateway,
      creditCardEnabled: dto.creditCardEnabled,
      pixEnabled: dto.pixEnabled,
      boletoEnabled: dto.boletoEnabled,
      maxInstallments: dto.maxInstallments,
      minInstallmentAmount: dto.minInstallmentAmount,
      stripePublishableKey: dto.stripePublishableKey,
    };
    const entries = Object.entries(mapping).filter(([, v]) => v !== undefined);
    await Promise.all(
      entries.map(([field, value]) =>
        this.prisma.systemSetting.upsert({
          where: { key: `payments.${field}` },
          create: { key: `payments.${field}`, value, updatedBy: adminId },
          update: { value, updatedBy: adminId },
        }),
      ),
    );
    this.logger.log(`Payment settings updated by ${adminId}`);
    return this.getPaymentSettings();
  }

  async getCheckoutPaymentMethods() {
    const settings = await this.getPaymentSettings();
    const methods = [];
    if (settings.creditCardEnabled) {
      methods.push({ id: 'CREDIT_CARD', label: 'Cartão de Crédito', desc: 'Parcele em até 12x' });
    }
    if (settings.pixEnabled) {
      methods.push({ id: 'PIX', label: 'Pix', desc: 'Pagamento imediato' });
    }
    if (settings.boletoEnabled) {
      methods.push({ id: 'BOLETO', label: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis' });
    }
    return {
      gateway: settings.gateway,
      methods,
      maxInstallments: settings.maxInstallments,
      minInstallmentAmount: settings.minInstallmentAmount,
    };
  }
}
