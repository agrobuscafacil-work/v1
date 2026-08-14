import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_PROVIDER, IPaymentProvider } from './providers/payment-provider.interface';

@Injectable()
export class PaymentCustomersService {
  private readonly logger = new Logger(PaymentCustomersService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private provider: IPaymentProvider,
  ) {}

  async getOrCreate(user: { id: string; email: string; name?: string | null }) {
    const existing = await this.prisma.paymentCustomer.findUnique({
      where: { userId_provider: { userId: user.id, provider: this.provider.name } },
    });
    if (existing) return existing;

    const providerCustomer = await this.provider.createCustomer(user.email, user.name || '');
    try {
      return await this.prisma.paymentCustomer.create({
        data: {
          userId: user.id,
          provider: this.provider.name,
          providerCustomerId: providerCustomer.providerCustomerId,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const again = await this.prisma.paymentCustomer.findUnique({
          where: { userId_provider: { userId: user.id, provider: this.provider.name } },
        });
        if (again) return again;
      }
      this.logger.error(`Failed to create payment customer for user ${user.id}`);
      throw error;
    }
  }
}