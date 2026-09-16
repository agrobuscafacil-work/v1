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

        // If Redis is explicitly disabled, return mock client immediately
        const redisEnabled = configService.get<string>('REDIS_ENABLED') !== 'false';
        if (!redisEnabled) {
          Logger.log('Redis disabled by config, using in-memory fallback', 'RedisModule');
          return createMockRedisClient();
        }

        const client = new Redis({
          host,
          port,
          password: password || undefined,
          lazyConnect: true,
          enableOfflineQueue: true,
          maxRetriesPerRequest: 3,
          family: 4,
          connectTimeout: 5000,
          retryStrategy: (times) => {
            // After 3 failed attempts, give up and use mock
            if (times > 3) {
              Logger.warn('Redis connection failed after 3 attempts, falling back to in-memory store', 'RedisModule');
              return null; // Stop retrying, will fall back to mock
            }
            const delay = Math.min(times * 500, 2000);
            Logger.warn(`Redis connection lost. Retrying in ${delay}ms... (attempt ${times})`, 'RedisModule');
            return delay;
          },
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          },
        });

        let isConnected = false;

        client.on('error', (err: any) => {
          Logger.warn(`Redis error: ${err.message}`, 'RedisModule');
        });

        client.on('connect', () => {
          Logger.log('Redis connected', 'RedisModule');
        });

        client.on('ready', () => {
          Logger.log('Redis ready', 'RedisModule');
          isConnected = true;
        });

        client.on('close', () => {
          Logger.warn('Redis connection closed', 'RedisModule');
          isConnected = false;
        });

        client.on('reconnecting', () => {
          Logger.log('Redis reconnecting...', 'RedisModule');
        });

        // Connect with proper error handling
        client.connect().catch((err) => {
          Logger.error(`Failed to connect to Redis: ${err.message}`, 'RedisModule');
        });

        // Return a proxy that falls back to mock when Redis is unavailable
        return new Proxy(client, {
          get(target, prop, receiver) {
            const original = Reflect.get(target, prop, receiver);
            if (typeof original === 'function') {
              return async (...args: any[]) => {
                // Check if Redis is available before each operation
                if (client.status !== 'ready') {
                  Logger.warn(`Redis not ready, using mock for ${String(prop)}`, 'RedisModule');
                  return mockRedis[prop as keyof typeof mockRedis](...args);
                }
                try {
                  return await original.apply(target, args);
                } catch (err) {
                  Logger.warn(`Redis operation failed, falling back to mock: ${err.message}`, 'RedisModule');
                  return mockRedis[prop as keyof typeof mockRedis](...args);
                }
              };
            }
            return Reflect.get(target, prop, receiver);
          },
        });
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

const mockStore = new Map<string, { value: string; expiry?: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of mockStore.entries()) {
    if (data.expiry && data.expiry < Date.now()) {
      mockStore.delete(key);
    }
  }
}, 60000);

interface MockRedis {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, ttlSeconds?: number): Promise<string>;
  del(...keys: string[]): Promise<number>;
  ping(): Promise<string>;
  keys(pattern: string): Promise<string[]>;
  eval(script: string, numKeys: number, ...keys: string[]): Promise<null>;
  evalsha(sha: string, numKeys: number, ...keys: string[]): Promise<null>;
  script(verb: string, ...args: string[]): Promise<string>;
  on(event: string, listener: (...args: any[]) => void): void;
  quit(): Promise<string>;
  close(): Promise<string>;
  status: string;
  [key: string]: any;
}

const mockRedis: MockRedis = {
  async get(key: string) {
    const data = mockStore.get(key);
    if (!data) return null;
    if (data.expiry && data.expiry < Date.now()) {
      mockStore.delete(key);
      return null;
    }
    return data.value;
  },
  async set(key: string, value: string, mode?: string, ttlSeconds?: number) {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    mockStore.set(key, { value, expiry });
    return 'OK';
  },
  async del(...keys: string[]) {
    let count = 0;
    for (const key of keys) {
      if (mockStore.delete(key)) count++;
    }
    return count;
  },
  async ping() {
    return 'PONG';
  },
  async keys(pattern: string) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(mockStore.keys()).filter(k => regex.test(k));
  },
  async eval(script: string, numKeys: number, ...keys: string[]) {
    return null;
  },
  async evalsha(sha: string, numKeys: number, ...keys: string[]) {
    return null;
  },
  async script(verb: string, ...args: string[]) {
    if (verb === 'LOAD') return 'mock_sha';
    return 'OK';
  },
  on(event: string, listener: (...args: any[]) => void) {
    // Mock event emitter
  },
  async quit() {
    return 'OK';
  },
  async close() {
    return 'OK';
  },
  status: 'ready',
};

function createMockRedisClient() {
  return mockRedis;
}