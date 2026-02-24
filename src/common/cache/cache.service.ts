import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CustomLoggerService } from '../logger/logger.service';

interface ResettableCache extends Cache {
  reset(): Promise<void>;
}

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: CustomLoggerService,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cacheManager.get<T>(key);
    if (value) {
      this.logger.debug(`Cache GET [HIT]: ${key}`, 'CacheService');
    } else {
      this.logger.debug(`Cache GET [MISS]: ${key}`, 'CacheService');
    }
    return value;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const ttlInMs = ttl ? ttl * 1000 : undefined;
    await this.cacheManager.set(key, value, ttlInMs);
    this.logger.debug(
      `Cache SET: ${key}, TTL: ${ttlInMs ?? 'default'}ms`,
      'CacheService',
    );
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.logger.debug(`Cache DEL: ${key}`, 'CacheService');
  }

  async reset(): Promise<void> {
    if ('reset' in this.cacheManager) {
      const resettable = this.cacheManager as ResettableCache;
      await resettable.reset();
      this.logger.warn(`Cache RESET: All keys cleared`, 'CacheService');
    }
  }
}
