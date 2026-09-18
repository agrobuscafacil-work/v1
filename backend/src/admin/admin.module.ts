import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogModule } from './audit-log.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [AuditLogModule, StripeModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
