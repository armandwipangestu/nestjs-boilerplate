import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { CustomLoggerService } from '../logger/logger.service';
import { StorageProvider } from './interfaces/storage.interface';
import { LocalStorageProvider } from './strategies/local.storage';
import { S3StorageProvider } from './strategies/s3.storage';

@Injectable()
export class StorageService {
  private readonly provider: StorageProvider;

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    const s3 = this.config.s3;

    if (s3?.accessKeyId && s3?.secretAccessKey && s3?.bucket) {
      this.provider = new S3StorageProvider({
        accessKeyId: s3.accessKeyId,
        secretAccessKey: s3.secretAccessKey,
        bucket: s3.bucket,
        region: s3.region,
        endpoint: s3.endpoint,
      });

      this.logger.log(
        `Storage initialized: ${s3.endpoint ? 'Custom S3' : 'AWS S3'}`,
        'StorageService',
      );
    } else {
      this.provider = new LocalStorageProvider(
        this.config.env.host,
        this.config.env.port,
      );

      this.logger.warn(
        'S3 config missing. Using local storage.',
        'StorageService',
      );
    }
  }

  upload(file: Express.Multer.File, folder?: string) {
    return this.provider.upload(file, folder);
  }

  delete(key: string) {
    return this.provider.delete(key);
  }

  getUrl(key: string) {
    return this.provider.getUrl(key);
  }
}