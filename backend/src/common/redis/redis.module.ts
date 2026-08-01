import { Global, Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = configService.get<number>('REDIS_PORT') || 6379;
        const password = configService.get<string>('REDIS_PASSWORD');

        const client = new Redis({
          host,
          port,
          password: password || undefined,
          lazyConnect: true,
          enableOfflineQueue: false,
          retryStrategy: () => null,
          maxRetriesPerRequest: null,
        });

        client.on('error', (err: any) => {
          Logger.warn(`Redis unavailable (${err.message}). Running without cache.`, 'RedisModule');
        });

        client.connect().catch(() => {});

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    // Cleanup handled by Redis itself
  }
}
