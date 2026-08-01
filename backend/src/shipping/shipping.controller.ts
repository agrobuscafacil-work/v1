import {
  Controller, Get, Post, Put, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { ShippingCostDto } from './dto/shipping-cost.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Put('config/:supplierId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update shipping config' })
  async updateConfig(@Param('supplierId') supplierId: string, @Body() deliveryInfo: any) {
    return this.shippingService.updateConfig(supplierId, deliveryInfo);
  }

  @Get('config/:supplierId')
  @Public()
  @ApiOperation({ summary: 'Get shipping config by supplier' })
  async getConfig(@Param('supplierId') supplierId: string) {
    return this.shippingService.getConfig(supplierId);
  }

  @Post('calculate/:supplierId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate shipping cost' })
  async calculateCost(@Param('supplierId') supplierId: string, @Body() dto: ShippingCostDto) {
    return this.shippingService.calculateCost(supplierId, dto);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user addresses' })
  async getAddresses(@CurrentUser() user: any) {
    return this.shippingService.getAddresses(user.id);
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add user address' })
  async addAddress(@CurrentUser() user: any, @Body() dto: any) {
    return this.shippingService.addAddress(user.id, dto);
  }
}
