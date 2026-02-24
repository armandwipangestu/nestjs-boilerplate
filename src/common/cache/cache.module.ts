import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { AppConfigService } from '../../config/app-config.service';
import { CacheService } from './cache.service';
import { AppConfigModule } from '../../config/app-config.module';
import { LoggerModule } from '../logger/logger.module';
import { CustomCacheInterceptor } from './interceptors/cache.interceptor';

@Global()
@Module({
  imports: [
    LoggerModule,
    NestCacheModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => {
        const redisUrl = `redis://${configService.redis.password ? `:${configService.redis.password}@` : ''}${configService.redis.host}:${configService.redis.port}`;

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: configService.cache.ttl * 1000,
                lruSize: 5000,
              }),
            }),
            new KeyvRedis(redisUrl),
          ],
          ttl: configService.cache.ttl * 1000, // Default TTL in ms
        };
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [CacheService, CustomCacheInterceptor],
  exports: [CacheService, NestCacheModule, CustomCacheInterceptor],
})
export class CacheModule {}
