import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { CacheModule } from '../common/cache/cache.module';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [PrismaModule, LoggerModule, CacheModule, StorageModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
