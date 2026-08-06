import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order' })
  async create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @CurrentUser() user: any, @Query('page') page?: number,
    @Query('limit') limit?: number, @Query('status') status?: string,
  ) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return this.ordersService.findAll({ page, limit, status });
    }
    if (user.role === 'SUPPLIER') {
      return this.ordersService.findForSupplier(user.id, page, limit);
    }
    return this.ordersService.findByUser(user.id, page, limit);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all orders (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  async findAllAdmin(
    @Query('page') page?: number, @Query('limit') limit?: number,
    @Query('status') status?: string, @Query('supplierId') supplierId?: string,
  ) {
    return this.ordersService.findAll({ page, limit, status, supplierId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findById(id, user);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto, user);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancel(id, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order (admin)' })
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
