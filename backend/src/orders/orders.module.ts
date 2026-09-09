import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [NotificationsModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
