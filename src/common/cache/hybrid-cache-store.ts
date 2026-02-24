import { KeyvStoreAdapter } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import Redis from 'ioredis';
import { CustomLoggerService } from '../logger/logger.service';

export class HybridCacheStore implements KeyvStoreAdapter {
  private readonly redisStore: KeyvRedis<any>;
  private readonly memoryStore: CacheableMemory;
  private lastStatus: string = '';
  public opts: any = {};
  public namespace?: string;

  constructor(
    private readonly redisClient: Redis,
    private readonly redisUrl: string,
    private readonly memoryOptions: { ttl: number; lruSize: number },
    private readonly logger: CustomLoggerService,
  ) {
    this.memoryStore = new CacheableMemory(this.memoryOptions);
    this.redisStore = new KeyvRedis(this.redisUrl);
  }

  private isRedisReady(): boolean {
    const ready = this.redisClient.status === 'ready';
    if (ready !== (this.lastStatus === 'ready')) {
      this.lastStatus = ready ? 'ready' : 'not_ready';
      if (!ready) {
        this.logger.warn(
          'Redis connection lost. Falling back to in-memory cache.',
          'HybridCacheStore',
        );
      } else {
        this.logger.log(
          'Redis connection restored. Resuming Redis cache.',
          'HybridCacheStore',
        );
      }
    }
    return ready;
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (this.isRedisReady()) {
      try {
        return await this.redisStore.get(key);
      } catch (error: unknown) {
        const err = error as Error;
        this.logger.error(
          `Redis Cache Get Error: ${err.message}`,
          err.stack,
          'HybridCacheStore',
        );
      }
    }
    return this.memoryStore.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Always update memory store as it's our failsafe
    this.memoryStore.set(key, value, ttl);

    if (this.isRedisReady()) {
      try {
        await this.redisStore.set(key, value as string, ttl);
      } catch (error: unknown) {
        const err = error as Error;
        this.logger.error(
          `Redis Cache Set Error: ${err.message}`,
          err.stack,
          'HybridCacheStore',
        );
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    this.memoryStore.delete(key);
    if (this.isRedisReady()) {
      try {
        const redisResult = await this.redisStore.delete(key);
        return redisResult ?? true;
      } catch (error: unknown) {
        const err = error as Error;
        this.logger.error(
          `Redis Cache Delete Error: ${err.message}`,
          err.stack,
          'HybridCacheStore',
        );
      }
    }
    return true;
  }

  async clear(): Promise<void> {
    this.memoryStore.clear();
    if (this.isRedisReady()) {
      try {
        await this.redisStore.clear();
      } catch (error: unknown) {
        const err = error as Error;
        this.logger.error(
          `Redis Cache Clear Error: ${err.message}`,
          err.stack,
          'HybridCacheStore',
        );
      }
    }
  }

  // Required by KeyvStoreAdapter
  on(): this {
    return this;
  }
}
