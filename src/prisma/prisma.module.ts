import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppConfigModule } from '../config/app-config.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [AppConfigModule, LoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
