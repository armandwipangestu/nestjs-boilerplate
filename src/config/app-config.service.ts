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

  get redis() {
    return this.config.getOrThrow<AppConfig['redis']>('app.redis');
  }

  get logging() {
    return this.config.getOrThrow<AppConfig['logging']>('app.logging');
  }

  get databaseUrl() {
    return this.config.getOrThrow<string>('app.databaseUrl');
  }
}