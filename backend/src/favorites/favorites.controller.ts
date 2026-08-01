import {
  Controller, Get, Post, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to favorites' })
  async add(@CurrentUser() user: any, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findByUser(
    @CurrentUser() user: any, @Query('page') page?: number, @Query('limit') limit?: number,
  ) {
    return this.favoritesService.findByUser(user.id, page, limit);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if item is favorited' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  async check(
    @CurrentUser() user: any,
    @Query('productId') productId?: string, @Query('supplierId') supplierId?: string,
  ) {
    return this.favoritesService.isFavorited(user.id, productId, supplierId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove from favorites' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.favoritesService.remove(id, user.id);
  }
}
