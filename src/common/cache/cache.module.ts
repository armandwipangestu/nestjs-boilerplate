import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import { AppConfigService } from '../../config/app-config.service';
import { CacheService } from './cache.service';
import { AppConfigModule } from '../../config/app-config.module';
import { LoggerModule } from '../logger/logger.module';
import { CustomCacheInterceptor } from './interceptors/cache.interceptor';
import { RedisModule, REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';
import { CustomLoggerService } from '../logger/logger.service';
import { HybridCacheStore } from './hybrid-cache-store';

@Global()
@Module({
  imports: [
    LoggerModule,
    NestCacheModule.registerAsync({
      imports: [AppConfigModule, RedisModule, LoggerModule],
      useFactory: (
        configService: AppConfigService,
        redisClient: Redis,
        logger: CustomLoggerService,
      ) => {
        const redisUrl = `redis://${configService.redis.password ? `:${configService.redis.password}@` : ''}${configService.redis.host}:${configService.redis.port}`;

        const hybridStore = new HybridCacheStore(
          redisClient,
          redisUrl,
          {
            ttl: configService.cache.ttl * 1000,
            lruSize: 5000,
          },
          logger,
        );

        return {
          stores: [new Keyv({ store: hybridStore })],
          ttl: configService.cache.ttl * 1000,
        };
      },
      inject: [AppConfigService, REDIS_CLIENT, CustomLoggerService],
    }),
  ],
  providers: [CacheService, CustomCacheInterceptor],
  exports: [CacheService, NestCacheModule, CustomCacheInterceptor],
})
export class CacheModule {}
