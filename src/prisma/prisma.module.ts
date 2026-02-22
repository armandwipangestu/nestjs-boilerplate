import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppConfigModule } from '../config/app-config.module';

@Module({
  imports: [AppConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
