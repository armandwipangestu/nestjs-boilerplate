import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Throttle } from '@nestjs/throttler';
import { CacheKey, CacheTTL } from './common/cache/decorators/cache.decorator';
import { CustomCacheInterceptor } from './common/cache/interceptors/cache.interceptor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseInterceptors(CustomCacheInterceptor)
  @CacheKey('hello_cache')
  @CacheTTL(30)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  getHello(): string {
    return this.appService.getHello();
  }
}
