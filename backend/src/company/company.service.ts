import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  private readonly CONFIG_KEY = 'company_info';

  constructor(private prisma: PrismaService) {}

  async getCompanyInfo() {
    const config = await this.prisma.systemConfig.findUnique({ where: { key: this.CONFIG_KEY } });
    return config?.value || null;
  }

  async updateCompanyInfo(data: any) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key: this.CONFIG_KEY },
      update: { value: data },
      create: { key: this.CONFIG_KEY, value: data, description: 'Company information' },
    });
    this.logger.log('Company info updated');
    return config.value;
  }
}
