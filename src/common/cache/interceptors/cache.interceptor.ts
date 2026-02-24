import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '../decorators/cache.decorator';
import { CustomLoggerService } from '../../logger/logger.service';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
    private readonly logger: CustomLoggerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const key = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!key) {
      return next.handle();
    }

    const cachedResponse = await this.cacheService.get(key);
    if (cachedResponse) {
      this.logger.log(`Cache HIT for key: ${key}`, 'CacheInterceptor');
      return of(cachedResponse);
    }

    this.logger.log(`Cache MISS for key: ${key}`, 'CacheInterceptor');
    return next.handle().pipe(
      tap((response) => {
        this.cacheService.set(key, response, ttl).catch(() => {
          // Ignore cache set errors in interceptor
        });
      }),
    );
  }
}
