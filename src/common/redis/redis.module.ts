import { Module, Global, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../../config/app-config.service';
import { CustomLoggerService } from '../logger/logger.service';
import { AppConfigModule } from '../../config/app-config.module';
import { LoggerModule } from '../logger/logger.module';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [AppConfigModule, LoggerModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: AppConfigService, logger: CustomLoggerService) => {
        const redis = new Redis({
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          retryStrategy: (times) => {
            const delay = Math.min(times * 100, 5000); // Slower retry to reduce noise
            return delay;
          },
          maxRetriesPerRequest: null,
        });

        let isErrorLogged = false;

        redis.on('connect', () => {
          logger.log('Connected to Redis', 'RedisModule');
          isErrorLogged = false;
        });

        redis.on('error', (error) => {
          if (!isErrorLogged) {
            logger.error(
              `Redis connection error: ${error.message}. App will continue in fallback mode.`,
              error.stack,
              'RedisModule',
            );
            isErrorLogged = true;
          }
        });

        redis.on('reconnecting', () => {
          // Only log reconnecting if we haven't logged an error/reconnect recently
          // or just keep it simple.
          if (!isErrorLogged) {
            logger.warn('Redis is disconnected. Retrying...', 'RedisModule');
            isErrorLogged = true;
          }
        });

        return redis;
      },
      inject: [AppConfigService, CustomLoggerService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(private readonly logger: CustomLoggerService) {}

  onModuleDestroy() {
    // Note: We don't have direct access to the client here easily without injecting it,
    // but the factory handles it. If we needed to close it explicitly:
    // this.redisClient.disconnect();
  }
}
