import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstitutionalService } from './institutional.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Institutional')
@Controller('institutional')
export class InstitutionalController {
  constructor(private readonly institutionalService: InstitutionalService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all institutional pages' })
  async getAll() {
    return this.institutionalService.getAllPages();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get institutional page by slug' })
  async getPage(@Param('slug') slug: string) {
    return this.institutionalService.getPage(slug);
  }

  @Post(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update institutional page (admin)' })
  async upsertPage(@Param('slug') slug: string, @Body() data: any) {
    return this.institutionalService.upsertPage(slug, data);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete institutional page (admin)' })
  async removePage(@Param('slug') slug: string) {
    return this.institutionalService.removePage(slug);
  }
}
