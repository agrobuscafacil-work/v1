import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhooksController } from './payments-webhooks.controller';
import { PaymentsService } from './payments.service';
import { PaymentCardsService } from './payment-cards.service';
import { PaymentCustomersService } from './payment-customers.service';
import { PaymentsWebhooksService } from './payments-webhooks.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController, PaymentsWebhooksController],
  providers: [
    PaymentsService,
    PaymentCardsService,
    PaymentCustomersService,
    PaymentsWebhooksService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}