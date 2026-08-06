import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  createProductStorage,
  productImageFilter,
  PRODUCT_UPLOAD_PATH,
  PRODUCT_ALLOWED_EXTENSIONS,
  PRODUCT_IMAGE_MAX_SIZE,
} from './products-upload.constants';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product' })
  async create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products with filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'featured', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: number, @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string, @Query('supplierId') supplierId?: string,
    @Query('search') search?: string, @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string, @Query('featured') featured?: string,
    @Query('status') status?: string,
  ) {
    return this.productsService.findAll({
      page, limit, categoryId, supplierId, search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      featured: featured === 'true',
      status,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List the current user supplier products' })
  async findMine(@CurrentUser() user: any) {
    return this.productsService.findMine(user.id);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a product image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createProductStorage(),
      fileFilter: productImageFilter,
      limits: { fileSize: PRODUCT_IMAGE_MAX_SIZE },
    }),
  )
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada');
    }
    return { url: `/products/images/${file.filename}` };
  }

  @Get('images/:filename')
  @Public()
  @ApiOperation({ summary: 'Serve an uploaded product image' })
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    if (
      !filename ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      throw new BadRequestException('Nome de arquivo inválido');
    }

    const ext = path.extname(filename).toLowerCase();
    if (!PRODUCT_ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException('Tipo de arquivo inválido');
    }

    const filePath = path.join(PRODUCT_UPLOAD_PATH, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    res.sendFile(filePath);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product permanently' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.remove(user, id);
  }
}
