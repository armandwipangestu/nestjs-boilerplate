import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { CustomLoggerService } from '../../logger/logger.service';

const PING_TIMEOUT_MS = 2000;

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly logger: CustomLoggerService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Race the ping against a timeout to prevent hanging when Redis is down.
      // This is necessary because maxRetriesPerRequest: null means ioredis will
      // queue commands indefinitely while trying to reconnect.
      const pong = await Promise.race([
        this.redisClient.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(`Redis PING timed out after ${PING_TIMEOUT_MS}ms`),
              ),
            PING_TIMEOUT_MS,
          ),
        ),
      ]);

      if (pong !== 'PONG') {
        throw new Error(`Unexpected Redis PING response: ${pong}`);
      }

      return this.getStatus(key, true);
    } catch (error: unknown) {
      const err = error as Error;
      // Log only on failure — successful pings should be silent to avoid noise
      this.logger.error(
        `Redis health check failed: ${err.message}`,
        err.stack,
        'RedisHealthIndicator',
      );
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { message: err.message }),
      );
    }
  }
}
