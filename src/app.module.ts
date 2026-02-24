import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { AppConfigService } from './config/app-config.service';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from './common/cache/cache.module';
import { LoggerModule } from './common/logger/logger.module';
import { CustomLoggerService } from './common/logger/logger.service';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule, LoggerModule],
      inject: [AppConfigService, CustomLoggerService],
      useFactory: (config: AppConfigService, logger: CustomLoggerService) => {
        logger.log(
          `Initializing Throttler with Redis storage (TTL: ${config.throttler.ttl}s, Limit: ${config.throttler.limit})`,
          'ThrottlerInitialization',
        );
        return {
          throttlers: [
            {
              ttl: config.throttler.ttl * 1000, // Throttler TTL is in milliseconds
              limit: config.throttler.limit,
            },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis({
              host: config.redis.host,
              port: config.redis.port,
              password: config.redis.password,
            }),
          ),
        };
      },
    }),
    PrismaModule,
    AuthModule,
    AppConfigModule,
    CacheModule,
    LoggerModule,
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
export class AppModule {}
