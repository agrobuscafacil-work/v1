import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminActionDto } from './dto/admin-action.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateEmailSettingsDto, TestEmailDto } from './dto/email-settings.dto';
import { UpdatePaymentSettingsDto } from './dto/payment-settings.dto';
import { SettingsService } from '../settings/settings.service';
import { StripeService } from '../stripe/stripe.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly settingsService: SettingsService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  async getStats() {
    return this.adminService.getSystemStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAuditLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(page, limit);
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending approvals' })
  async getPendingApprovals() {
    return this.adminService.getPendingApprovals();
  }

  @Put('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate/deactivate user' })
  async manageUserStatus(@Param('id') id: string, @Body() dto: AdminActionDto) {
    return this.adminService.manageUserStatus(id, dto.active);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update platform settings' })
  async updateSettings(@CurrentUser() user: any, @Body() dto: UpdateSettingsDto) {
    return this.adminService.updateSettings(user.id, dto);
  }

  @Get('settings/email')
  @ApiOperation({ summary: 'Get email (SMTP) settings (password never returned)' })
  async getEmailSettings() {
    return this.settingsService.getEmailSettings();
  }

  @Put('settings/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update email (SMTP) settings' })
  async updateEmailSettings(@CurrentUser() user: any, @Body() dto: UpdateEmailSettingsDto) {
    return this.settingsService.updateEmailSettings(user.id, dto);
  }

  @Post('settings/email/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email with current SMTP settings' })
  async testEmailSettings(@Body() dto: TestEmailDto) {
    return this.settingsService.testEmailSettings(dto.to);
  }

  @Get('settings/payments')
  @ApiOperation({ summary: 'Get payment settings and provider status' })
  async getPaymentSettings() {
    return this.settingsService.getPaymentSettings();
  }

  @Put('settings/payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update payment settings (secrets stay in env)' })
  async updatePaymentSettings(@CurrentUser() user: any, @Body() dto: UpdatePaymentSettingsDto) {
    return this.settingsService.updatePaymentSettings(user.id, dto);
  }

  @Post('settings/payments/test-stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Stripe connection with configured secret key' })
  async testStripeConnection() {
    return this.stripeService.testConnection();
  }
}
