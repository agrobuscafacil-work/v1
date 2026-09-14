import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM') || 'noreply@agrobuscafacil.com';

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Emails will be logged instead of sent.');
      this.transporter = null as any;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP connection established');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM') || 'noreply@agrobuscafacil.com';

    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`);
      this.logger.debug(`[MOCK EMAIL] HTML: ${options.html}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string, resetUrl: string): Promise<boolean> {
    const subject = 'Redefinição de senha - AgroBuscaFácil';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AgroBuscaFácil</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Redefinição de senha</h2>
          <p style="font-size: 16px;">Olá <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você quem fez essa solicitação, clique no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}?token=${resetToken}" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">Redefinir minha senha</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Ou copie e cole este link no seu navegador:</p>
          <p style="font-size: 13px; color: #16a34a; word-break: break-all; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #dcfce7;">${resetUrl}?token=${resetToken}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 13px; color: #9ca3af;">Este link expira em <strong>1 hora</strong> por segurança.</p>
          <p style="font-size: 13px; color: #9ca3af;">Se você não solicitou esta redefinição, por favor ignore este e-mail ou entre em contato com nosso suporte.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 AgroBuscaFácil. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendEmailConfirmation(email: string, name: string, confirmationToken: string, confirmUrl: string): Promise<boolean> {
    const subject = 'Confirme seu e-mail - AgroBuscaFácil';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AgroBuscaFácil</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Bem-vindo ao AgroBuscaFácil!</h2>
          <p style="font-size: 16px;">Olá <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">Obrigado por se cadastrar! Para ativar sua conta, por favor confirme seu endereço de e-mail clicando no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}?token=${confirmationToken}" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">Confirmar meu e-mail</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Ou copie e cole este link no seu navegador:</p>
          <p style="font-size: 13px; color: #16a34a; word-break: break-all; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #dcfce7;">${confirmUrl}?token=${confirmationToken}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 13px; color: #9ca3af;">Este link expira em <strong>24 horas</strong>.</p>
          <p style="font-size: 13px; color: #9ca3af;">Se você não criou esta conta, por favor ignore este e-mail.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 AgroBuscaFácil. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const subject = 'Bem-vindo ao AgroBuscaFácil!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AgroBuscaFácil</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Sua conta está ativa! 🎉</h2>
          <p style="font-size: 16px;">Olá <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">Seu e-mail foi confirmado com sucesso. Agora você tem acesso completo ao AgroBuscaFácil.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">Acessar plataforma</a>
          </div>
          <h3 style="color: #1f2937; margin-top: 30px; font-size: 16px;">O que você pode fazer agora:</h3>
          <ul style="font-size: 15px; color: #374151; padding-left: 20px;">
            <li style="margin-bottom: 8px;">🔍 <strong>Buscar produtos</strong> agrícolas e pecuários</li>
            <li style="margin-bottom: 8px;">🏪 <strong>Encontrar fornecedores</strong> confiáveis</li>
            <li style="margin-bottom: 8px;">💬 <strong>Conversar com vendedores</strong> via chat</li>
            <li style="margin-bottom: 8px;">⭐ <strong>Avaliar produtos</strong> e compartilhar experiências</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 13px; color: #9ca3af;">Precisa de ajuda? Entre em contato com nosso <a href="${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}/support" style="color: #16a34a;">suporte</a>.</p>
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 AgroBuscaFácil. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendSupplierWelcomeEmail(email: string, name: string, companyName: string): Promise<boolean> {
    const subject = 'Bem-vindo como Fornecedor - AgroBuscaFácil';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AgroBuscaFácil</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0; font-size: 16px;">Painel do Fornecedor</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Bem-vindo, ${name}!</h2>
          <p style="font-size: 16px;">Sua conta de fornecedor para <strong>${companyName}</strong> foi aprovada e está pronta para uso.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}/supplier/dashboard" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">Acessar Painel do Fornecedor</a>
          </div>
          <h3 style="color: #1f2937; margin-top: 30px; font-size: 16px;">No painel você pode:</h3>
          <ul style="font-size: 15px; color: #374151; padding-left: 20px;">
            <li style="margin-bottom: 8px;">📦 <strong>Cadastrar produtos</strong> com imagens, preços e especificações</li>
            <li style="margin-bottom: 8px;">📊 <strong>Acompanhar pedidos</strong> e vendas em tempo real</li>
            <li style="margin-bottom: 8px;">💬 <strong>Responder clientes</strong> via chat integrado</li>
            <li style="margin-bottom: 8px;">📈 <strong>Ver relatórios</strong> de performance e métricas</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 13px; color: #9ca3af;">Dúvidas? Consulte nossa <a href="${this.configService.get('FRONTEND_URL') || 'https://agrobuscafacil.com'}/help" style="color: #2563eb;">Central de Ajuda</a> ou entre em contato com o suporte.</p>
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 AgroBuscaFácil. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}