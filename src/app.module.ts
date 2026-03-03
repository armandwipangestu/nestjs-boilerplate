import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppConfigService } from './config/app-config.service';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from './common/cache/cache.module';
import { LoggerModule } from './common/logger/logger.module';
import { CustomLoggerService } from './common/logger/logger.service';
import { RedisModule, REDIS_CLIENT } from './common/redis/redis.module';
import { HybridThrottlerStorage } from './common/throttler/hybrid-throttler-storage';
import Redis from 'ioredis';
import { HealthModule } from './common/health/health.module';
import { PostModule } from './post/post.module';
import { StorageModule } from './common/storage/storage.module';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule, LoggerModule, RedisModule],
      inject: [AppConfigService, CustomLoggerService, REDIS_CLIENT],
      useFactory: (
        config: AppConfigService,
        logger: CustomLoggerService,
        redisClient: Redis,
      ) => {
        logger.log(
          `Initializing Throttler with Hybrid storage (TTL: ${config.throttler.ttl}s, Limit: ${config.throttler.limit})`,
          'ThrottlerInitialization',
        );
        return {
          throttlers: [
            {
              ttl: config.throttler.ttl * 1000,
              limit: config.throttler.limit,
            },
          ],
          storage: new HybridThrottlerStorage(redisClient, logger),
        };
      },
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    AppConfigModule,
    RedisModule,
    CacheModule,
    HealthModule,
    PostModule,
    StorageModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
