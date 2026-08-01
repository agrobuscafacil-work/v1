import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstitutionalService {
  private readonly logger = new Logger(InstitutionalService.name);
  private readonly CONFIG_KEY_PREFIX = 'institutional_page_';

  constructor(private prisma: PrismaService) {}

  async getPage(slug: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key: `${this.CONFIG_KEY_PREFIX}${slug}` } });
    return config?.value || null;
  }

  async upsertPage(slug: string, data: any) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key: `${this.CONFIG_KEY_PREFIX}${slug}` },
      update: { value: data },
      create: { key: `${this.CONFIG_KEY_PREFIX}${slug}`, value: data, description: `Institutional page: ${slug}` },
    });
    this.logger.log(`Institutional page ${slug} updated`);
    return config.value;
  }

  async getAllPages() {
    const configs = await this.prisma.systemConfig.findMany({
      where: { key: { startsWith: this.CONFIG_KEY_PREFIX } },
    });
    return configs.map(c => ({ slug: c.key.replace(this.CONFIG_KEY_PREFIX, ''), ...c.value as any }));
  }

  async removePage(slug: string) {
    await this.prisma.systemConfig.delete({ where: { key: `${this.CONFIG_KEY_PREFIX}${slug}` } });
    this.logger.log(`Institutional page ${slug} deleted`);
    return { message: 'Page deleted successfully' };
  }
}
