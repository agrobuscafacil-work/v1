import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { ShippingModule } from './shipping/shipping.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { ServicesModule } from './services/services.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CompanyModule } from './company/company.module';
import { InstitutionalModule } from './institutional/institutional.module';
import { BannerModule } from './banner/banner.module';
import { SupportModule } from './support/support.module';
import { StripeModule } from './stripe/stripe.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL') || 60000,
            limit: config.get<number>('THROTTLE_LIMIT') || 100,
          },
        ],
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    SuppliersModule,
    ProductsModule,
    ServicesModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    CheckoutModule,
    ChatModule,
    ReviewsModule,
    PaymentsModule,
    ShippingModule,
    DashboardModule,
    AdminModule,
    NotificationsModule,
    SearchModule,
    FavoritesModule,
    CompanyModule,
    InstitutionalModule,
    BannerModule,
    SupportModule,
    StripeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
