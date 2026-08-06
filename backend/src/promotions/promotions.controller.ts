import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a promotion (supplier)' })
  async create(@CurrentUser() user: any, @Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(user, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List active promotions' })
  @ApiQuery({ name: 'supplierId', required: false })
  async findAll(@Query('supplierId') supplierId?: string) {
    return this.promotionsService.findAllPublic({ supplierId });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List own promotions (supplier)' })
  async findMine(@CurrentUser() user: any) {
    return this.promotionsService.findMine(user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a promotion' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a promotion' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.promotionsService.remove(user, id);
  }
}
