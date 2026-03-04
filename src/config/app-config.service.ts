import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app.config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get jwt() {
    return this.config.getOrThrow<AppConfig['jwt']>('app.jwt');
  }

  get env() {
    return this.config.getOrThrow<AppConfig['env']>('app.env');
  }

  get isCorsEnabled(): boolean {
    const origins = this.env.corsAllowedOrigins;
    return !!origins;
  }

  get corsAllowedOrigins(): string[] {
    const origins = this.env.corsAllowedOrigins;

    if (!origins || origins === '*') {
      return ['*'];
    }

    return origins.split(',').map((o) => o.trim());
  }

  get corsConfig() {
    const origins = this.corsAllowedOrigins;

    return {
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }

  get redis() {
    return this.config.getOrThrow<AppConfig['redis']>('app.redis');
  }

  get logging() {
    return this.config.getOrThrow<AppConfig['logging']>('app.logging');
  }

  get databaseUrl() {
    return this.config.getOrThrow<string>('app.databaseUrl');
  }

  get throttler() {
    return this.config.getOrThrow<AppConfig['throttler']>('app.throttler');
  }

  get cache() {
    return this.config.getOrThrow<AppConfig['cache']>('app.cache');
  }

  get s3() {
    return this.config.get<AppConfig['s3']>('app.s3');
  }

  get openTelemetry() {
    return this.config.getOrThrow<AppConfig['openTelemetry']>(
      'app.openTelemetry',
    );
  }

  get dbSlowQueryThreshold() {
    return this.openTelemetry.dbSlowQueryThreshold;
  }
}
