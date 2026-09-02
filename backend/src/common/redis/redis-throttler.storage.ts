import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

interface MemoryEntry {
  hits: number;
  expiresAt: number;
  blockedUntil: number;
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly memory = new Map<string, MemoryEntry>();
  private redisAvailable = false;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    if (this.redis.status === 'ready') {
      this.redisAvailable = true;
    }
    this.redis.on('ready', () => {
      this.redisAvailable = true;
      this.logger.log('Throttler storage switched to Redis');
    });
    this.redis.on('close', () => {
      this.redisAvailable = false;
      this.logger.warn('Throttler storage fell back to in-memory');
    });
    this.redis.on('error', () => {
      this.redisAvailable = false;
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `throttle:${throttlerName}:${key}`;
    if (this.redisAvailable) {
      try {
        const pipeline = this.redis.pipeline();
        pipeline.incr(redisKey);
        pipeline.pexpire(redisKey, ttl, 'NX');
        const results = await pipeline.exec();
        const totalHits = Number(results?.[0]?.[1] ?? 0);
        const ttlMs = await this.redis.pttl(redisKey);
        const blocked = totalHits > limit;
        if (blocked) {
          await this.redis.pexpire(redisKey, Math.max(ttlMs, blockDuration));
        }
        return {
          totalHits,
          timeToExpire: Math.max(0, Math.ceil(ttlMs / 1000)),
          isBlocked: blocked,
          timeToBlockExpire: blocked ? Math.max(0, Math.ceil(blockDuration / 1000)) : 0,
        };
      } catch (error) {
        this.redisAvailable = false;
        this.logger.warn(`Redis throttle failed, falling back: ${(error as Error).message}`);
      }
    }

    return this.incrementMemory(redisKey, ttl, limit, blockDuration);
  }

  private incrementMemory(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    const now = Date.now();
    const entry = this.memory.get(key);
    const current: MemoryEntry =
      entry && entry.expiresAt > now
        ? entry
        : { hits: 0, expiresAt: now + ttl, blockedUntil: 0 };

    current.hits += 1;
    const isBlocked = current.hits > limit;
    if (isBlocked && current.blockedUntil < now) {
      current.blockedUntil = now + blockDuration;
    }
    this.memory.set(key, current);

    if (this.memory.size > 10000) {
      for (const [k, v] of this.memory) {
        if (v.expiresAt <= now) this.memory.delete(k);
      }
    }

    return {
      totalHits: current.hits,
      timeToExpire: Math.max(0, Math.ceil((current.expiresAt - now) / 1000)),
      isBlocked,
      timeToBlockExpire: isBlocked ? Math.max(0, Math.ceil((current.blockedUntil - now) / 1000)) : 0,
    };
  }
}