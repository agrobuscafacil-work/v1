import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogSessionDto, LogSearchDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async logSearch(dto: LogSearchDto) {
    const term = dto.term.trim().slice(0, 200);
    if (!term) return { ok: true };

    await this.prisma.searchLog.upsert({
      where: { term },
      create: { term, count: 1 },
      update: { count: { increment: 1 } },
    }).catch((e) => this.logger.warn(`Falha ao registrar busca: ${e.message}`));

    return { ok: true };
  }

  async logSession(dto: LogSessionDto) {
    try {
      await this.prisma.sessionLog.create({
        data: {
          sessionId: dto.sessionId || 'anon',
          pagePath: dto.pagePath || '/',
          userAgent: dto.userAgent,
          device: dto.device,
          browser: dto.browser,
        },
      });
    } catch (e) {
      this.logger.warn(`Falha ao registrar sessão: ${e.message}`);
    }
    return { ok: true };
  }
}