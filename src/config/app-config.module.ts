import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import { AppConfigService } from './app-config.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
