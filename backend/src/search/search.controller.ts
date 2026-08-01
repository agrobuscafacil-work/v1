import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search across products, services and suppliers' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['products', 'services', 'suppliers'] })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['price_asc', 'price_desc', 'name', 'newest'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') q?: string, @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string, @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string, @Query('page') page?: number, @Query('limit') limit?: number,
  ) {
    return this.searchService.search({
      q, categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort, page, limit,
    });
  }
}
