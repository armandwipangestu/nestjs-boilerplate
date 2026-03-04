import { Module, Global, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../../config/app-config.service';
import { CustomLoggerService } from '../logger/logger.service';
import { AppConfigModule } from '../../config/app-config.module';
import { LoggerModule } from '../logger/logger.module';
import { MetricsService } from '../observability/metrics.service';


export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [AppConfigModule, LoggerModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (
        config: AppConfigService,
        logger: CustomLoggerService,
        metricsService: MetricsService,
      ) => {
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



        // Metrics Wrapper
        const metricsWrapper = new Proxy(redis, {
          get: (target, prop, receiver) => {
            const originalValue = Reflect.get(target, prop, receiver);

            if (typeof originalValue === 'function' && typeof prop === 'string') {
              // Only wrap actual commands (ioredis commands are usually lowercase)
              // This is a simple heuristic. ioredis also has an internal list of commands.
              const isCommand = /^[a-z]/.test(prop) && !['on', 'once', 'off', 'emit', 'quit', 'disconnect'].includes(prop);

              if (isCommand) {
                return async (...args: any[]) => {
                  const startTime = process.hrtime.bigint();
                  const labels = { command: prop };

                  // Increment total counter (all attempts)
                  metricsService.redisCommandTotal.add(1, labels);

                  try {
                    const result = await originalValue.apply(target, args);
                    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

                    metricsService.redisCommandDuration.record(durationMs, labels);

                    return result;
                  } catch (error) {
                    metricsService.redisCommandErrorsTotal.add(1, labels);
                    throw error;
                  }
                };
              }
            }

            return originalValue;
          },
        });

        return metricsWrapper;
      },
      inject: [AppConfigService, CustomLoggerService, MetricsService],
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
