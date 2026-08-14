import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { MockPaymentProvider } from './providers/mock.provider';

@Global()
@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (config: ConfigService) =>
        config.get<string>('MP_ENABLED') === 'true'
          ? new MercadoPagoProvider(config)
          : new MockPaymentProvider(),
      inject: [ConfigService],
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentProviderModule {}
