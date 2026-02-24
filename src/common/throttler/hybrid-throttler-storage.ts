import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ThrottlerStorageService as ThrottlerStorageMemoryService } from '@nestjs/throttler';
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class HybridThrottlerStorage implements ThrottlerStorage {
  private readonly redisStorage: ThrottlerStorageRedisService;
  private readonly memoryStorage: ThrottlerStorageMemoryService;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly logger: CustomLoggerService,
  ) {
    this.redisStorage = new ThrottlerStorageRedisService(this.redisClient);
    this.memoryStorage = new ThrottlerStorageMemoryService();
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const isRedisConnected = this.redisClient.status === 'ready';

    if (isRedisConnected) {
      try {
        return await this.redisStorage.increment(
          key,
          ttl,
          limit,
          blockDuration,
          throttlerName,
        );
      } catch (error: unknown) {
        const err = error as Error;
        this.logger.error(
          `Redis Throttler Error: ${err.message}. Falling back to in-memory.`,
          err.stack,
          'HybridThrottlerStorage',
        );
      }
    } else if (
      this.redisClient.status === 'reconnecting' ||
      this.redisClient.status === 'connecting'
    ) {
      // Just log once or occasionally? Let's log it.
      this.logger.warn(
        `Redis is ${this.redisClient.status}. Using in-memory fallback.`,
        'HybridThrottlerStorage',
      );
    }

    return await this.memoryStorage.increment(
      key,
      ttl,
      limit,
      blockDuration,
      throttlerName,
    );
  }
}
