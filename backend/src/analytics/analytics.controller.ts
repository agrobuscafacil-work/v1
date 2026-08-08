import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { LogSearchDto, LogSessionDto } from './dto/analytics.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('search')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a search term' })
  async logSearch(@Body() dto: LogSearchDto) {
    return this.analyticsService.logSearch(dto);
  }

  @Post('session')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a page view / session' })
  async logSession(@Body() dto: LogSessionDto) {
    return this.analyticsService.logSession(dto);
  }
}