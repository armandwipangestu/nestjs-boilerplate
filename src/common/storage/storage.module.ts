import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AppConfigModule } from '../../config/app-config.module';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [AppConfigModule, LoggerModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
