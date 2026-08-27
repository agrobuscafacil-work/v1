import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierStoreAddressDto } from './dto/supplier-store-address.dto';
import { SupplierApprovalDto } from './dto/supplier-approval.dto';
import { UpdateSupplierWorkingHoursDto } from './dto/supplier-working-hours.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import path from 'path';
import { FileStorageService } from '../common/storage/file-storage.service';
import { detectFileType, isAllowedDetectedType } from '../common/utils/file-type-check';
import { createSupplierStorage, supplierImageFilter, SUPPLIER_IMAGE_EXTENSIONS, SUPPLIER_IMAGE_MAX_SIZE } from './suppliers-upload.constants';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService, private readonly storage: FileStorageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create supplier profile' })
  async create(@CurrentUser() user: any, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(user.id, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List suppliers' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number, @Query('limit') limit?: number,
    @Query('status') status?: string, @Query('search') search?: string,
  ) {
    return this.suppliersService.findAll({ page, limit, status: status as any, search });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get own supplier profile' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.suppliersService.findByUserId(user.id);
  }

  @Get('me/store-address')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get own store address' })
  async getMyStoreAddress(@CurrentUser() user: any) {
    return this.suppliersService.getStoreAddress(user.id);
  }

  @Put('me/store-address')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own store address and location' })
  async updateMyStoreAddress(@CurrentUser() user: any, @Body() dto: SupplierStoreAddressDto) {
    return this.suppliersService.updateStoreAddress(user.id, dto);
  }

  @Get('me/working-hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get own store working hours' })
  async getMyWorkingHours(@CurrentUser() user: any) {
    return this.suppliersService.getWorkingHours(user.id);
  }

  @Put('me/working-hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own store working hours' })
  async updateMyWorkingHours(@CurrentUser() user: any, @Body() dto: UpdateSupplierWorkingHoursDto) {
    return this.suppliersService.updateWorkingHours(user.id, dto.hours);
  }

  @Post('me/logo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: createSupplierStorage(), fileFilter: supplierImageFilter, limits: { fileSize: SUPPLIER_IMAGE_MAX_SIZE } }))
  async uploadLogo(@CurrentUser() user: any, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhuma imagem enviada');
    const detected = detectFileType(file.buffer);
    if (!detected || !isAllowedDetectedType(detected, { images: true })) throw new BadRequestException('Arquivo inválido: o conteúdo não é uma imagem permitida');
    const filename = `${randomUUID()}${detected.ext}`;
    await this.storage.save('suppliers', filename, file.buffer, detected.mime);
    const logoUrl = this.storage.isCloud ? this.storage.publicUrl('suppliers', filename) : `/suppliers/images/${filename}`;
    return this.suppliersService.updateLogo(user.id, logoUrl);
  }

  @Get('images/:filename')
  @Public()
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) throw new BadRequestException('Nome de arquivo inválido');
    const ext = path.extname(filename).toLowerCase();
    if (!SUPPLIER_IMAGE_EXTENSIONS.has(ext)) throw new BadRequestException('Tipo de arquivo inválido');
    if (this.storage.isCloud) return res.redirect(HttpStatus.FOUND, this.storage.publicUrl('suppliers', filename));
    const filePath = path.join(process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(process.cwd(), 'uploads'), 'suppliers', filename);
    if (!existsSync(filePath)) throw new NotFoundException('Arquivo não encontrado');
    return res.sendFile(filePath);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all suppliers with user data (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAllAdmin(
    @Query('page') page?: number, @Query('limit') limit?: number,
    @Query('status') status?: string, @Query('search') search?: string,
  ) {
    return this.suppliersService.findAllAdmin({ page, limit, status: status as any, search });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get supplier by ID' })
  async findById(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update supplier profile' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto, user);
  }

  @Put(':id/approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve or reject supplier (admin)' })
  async approve(@Param('id') id: string, @Body() dto: SupplierApprovalDto) {
    return this.suppliersService.approve(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete supplier (admin)' })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
