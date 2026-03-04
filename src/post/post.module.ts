import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    // CacheModule is @Global() so CacheService is available without explicit import
  ],
  providers: [PostService, PostRepository],
  controllers: [PostController],
  exports: [PostService, PostRepository],
})
export class PostModule {}
