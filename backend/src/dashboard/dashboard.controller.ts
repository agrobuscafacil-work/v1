import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('supplier/stats')
  @ApiOperation({ summary: 'Get supplier dashboard stats' })
  async getSupplierStats(@CurrentUser() user: any) {
    return this.dashboardService.getSupplierStats(user.supplierId || user.id);
  }

  @Get('supplier/sales')
  @ApiOperation({ summary: 'Get supplier sales by period' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSupplierSales(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth(), 1);
    return this.dashboardService.getSupplierSalesByPeriod(user.supplierId || user.id, start, end);
  }

  @Get('supplier/top-products')
  @ApiOperation({ summary: 'Get supplier top selling products' })
  async getTopProducts(@CurrentUser() user: any, @Query('limit') limit?: number) {
    return this.dashboardService.getSupplierTopProducts(user.supplierId || user.id, limit);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }
}
