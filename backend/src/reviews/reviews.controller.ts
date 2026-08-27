import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateSellerReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { SellerReviewResponseDto } from './dto/seller-review-response.dto';
import { CreateReviewReportDto, ReviewReportReason, ReviewReportStatus } from './dto/review-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar avaliação de produto' })
  async create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Post('seller')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar avaliação de vendedor' })
  async createSellerReview(@CurrentUser() user: any, @Body() dto: CreateSellerReviewDto) {
    return this.reviewsService.createSellerReview(user.id, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar avaliações de produtos com filtros' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'serviceId', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('productId') productId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.reviewsService.findAll({ page, limit, productId, serviceId, supplierId, status });
  }

  @Get('seller')
  @Public()
  @ApiOperation({ summary: 'Listar avaliações de vendedores' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findSellerReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.reviewsService.findSellerReviews({ page, limit, supplierId, status });
  }

  @Get(':id/like/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Consultar curtida em avaliação de produto' })
  async getLikeStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.getLikeStatus(id, user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Curtir avaliação de produto' })
  async like(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.like(id, user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover curtida de avaliação de produto' })
  async unlike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.unlike(id, user.id);
  }

  @Get('seller/:id/like/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Consultar curtida em avaliação de fornecedor' })
  async getSellerLikeStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.getSellerLikeStatus(id, user.id);
  }

  @Post('seller/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Curtir avaliação de fornecedor' })
  async likeSeller(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.likeSeller(id, user.id);
  }

  @Delete('seller/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover curtida de avaliação de fornecedor' })
  async unlikeSeller(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.unlikeSeller(id, user.id);
  }

  @Get('product/:productId/summary')
  @Public()
  @ApiOperation({ summary: 'Obter resumo de avaliações de um produto' })
  async getProductSummary(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewsSummary(productId);
  }

  @Get('seller/:supplierId/summary')
  @Public()
  @ApiOperation({ summary: 'Obter resumo de avaliações de um vendedor' })
  async getSellerSummary(@Param('supplierId') supplierId: string) {
    return this.reviewsService.getSellerReviewsSummary(supplierId);
  }

  @Get('eligible')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter itens do usuário elegíveis para avaliação' })
  async getEligibleItems(@CurrentUser() user: any) {
    return this.reviewsService.getUserEligibleItems(user.id);
  }

  @Get('eligible-seller')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter pedidos do usuário elegíveis para avaliação de vendedor' })
  async getEligibleSellerOrders(@CurrentUser() user: any) {
    return this.reviewsService.getUserEligibleSellerOrders(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obter avaliação por ID' })
  async findById(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Get('seller/:id')
  @Public()
  @ApiOperation({ summary: 'Obter avaliação de vendedor por ID' })
  async findSellerReviewById(@Param('id') id: string) {
    return this.reviewsService.findSellerReviewById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar própria avaliação de produto' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, user.id, dto);
  }

  @Put('seller/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar própria avaliação de vendedor' })
  async updateSellerReview(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateSellerReview(id, user.id, dto);
  }

  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Moderar avaliação de produto (admin)' })
  async moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderate(id, dto);
  }

  @Put('seller/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Moderar avaliação de vendedor (admin)' })
  async moderateSellerReview(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderateSellerReview(id, dto);
  }

  @Post(':id/response')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vendedor responder a avaliação de produto' })
  async addProductResponse(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SellerReviewResponseDto) {
    return this.reviewsService.addProductResponse(id, user.id, dto);
  }

  @Post('seller/:id/response')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vendedor responder a avaliação de vendedor' })
  async addSellerResponse(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SellerReviewResponseDto) {
    return this.reviewsService.addResponse(id, user.id, dto);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Denunciar avaliação de produto' })
  async report(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CreateReviewReportDto) {
    return this.reviewsService.report(id, user.id, dto);
  }

  @Post('seller/:id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Denunciar avaliação de vendedor' })
  async reportSellerReview(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CreateReviewReportDto) {
    return this.reviewsService.reportSellerReview(id, user.id, dto);
  }

  @Patch('reports/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Moderar denúncia de avaliação (admin)' })
  async moderateReport(@Param('id') id: string, @Body() dto: { status: ReviewReportStatus }, @CurrentUser() user: any) {
    return this.reviewsService.moderateReport(id, dto, user.id);
  }

  @Patch('seller-reports/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Moderar denúncia de avaliação de vendedor (admin)' })
  async moderateSellerReport(@Param('id') id: string, @Body() dto: { status: ReviewReportStatus }, @CurrentUser() user: any) {
    return this.reviewsService.moderateSellerReport(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir avaliação (dono, vendedor ou admin)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.remove(id, { id: user.id, role: user.role });
  }

  @Delete('seller/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir avaliação de vendedor (dono, vendedor ou admin)' })
  async removeSellerReview(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.removeSellerReview(id, { id: user.id, role: user.role });
  }

  @Get('supplier/:supplierId/stats')
  @Public()
  @ApiOperation({ summary: 'Obter estatísticas de avaliações de um fornecedor' })
  async getSupplierStats(@Param('supplierId') supplierId: string) {
    return this.reviewsService.getReviewStats(supplierId);
  }
}