import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomLoggerService } from '../common/logger/logger.service';
import { CacheService } from '../common/cache/cache.service';
import { PostRepository, PostWithAuthor } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { PostListResponseDto, PostResponseDto } from './dto/post-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import type { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

const POST_CACHE_PREFIX = 'posts';
const POST_LIST_CACHE_PREFIX = `${POST_CACHE_PREFIX}:list`;

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly logger: CustomLoggerService,
    private readonly cacheService: CacheService,
  ) {}

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private postCacheKey(id: string): string {
    return `${POST_CACHE_PREFIX}:${id}`;
  }

  private listCacheKey(query: PostQueryDto): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(query))
      .digest('hex');
    return `${POST_LIST_CACHE_PREFIX}:${hash}`;
  }

  private toPostResponseDto(post: PostWithAuthor): PostResponseDto {
    return plainToInstance(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  private async invalidatePostCache(postId: string): Promise<void> {
    await this.cacheService.del(this.postCacheKey(postId));
    this.logger.debug(`Cache invalidated for post: ${postId}`, 'PostService');
  }

  private async invalidateListCache(): Promise<void> {
    // Pattern-based invalidation: clear all list cache keys by prefix scan
    // We use CacheService.reset() only when scoped patterns are unavailable.
    // For simplicity here we reset the whole cache — in large systems use
    // a Redis SCAN + DEL by pattern.
    await this.cacheService.reset();
    this.logger.debug(
      'Post list cache invalidated (full reset)',
      'PostService',
    );
  }

  // ─── Public CRUD Methods ───────────────────────────────────────────────────

  async findAll(
    query: PostQueryDto,
    isAdmin: boolean = false,
  ): Promise<PostListResponseDto> {
    const cacheKey = this.listCacheKey({
      ...query,
      published: query.published,
    });
    const cached = await this.cacheService.get<PostListResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(
        `Cache HIT for post list (key: ${cacheKey})`,
        'PostService',
      );
      return cached;
    }

    const { page = 1, limit = 10, search, published } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      // Non-admins can only see published posts unless explicitly querying
      ...(published !== undefined
        ? { published }
        : !isAdmin
          ? { published: true }
          : {}),
    };

    const [posts, total] = await Promise.all([
      this.postRepository.findMany(where, skip, limit),
      this.postRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    const result: PostListResponseDto = {
      data: posts.map((p) => this.toPostResponseDto(p)),
      meta,
    };

    await this.cacheService.set(cacheKey, result);
    this.logger.log(
      `Cache SET for post list (key: ${cacheKey}), total: ${total}`,
      'PostService',
    );

    return result;
  }

  async findOne(id: string): Promise<PostResponseDto> {
    const cacheKey = this.postCacheKey(id);
    const cached = await this.cacheService.get<PostResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for post: ${id}`, 'PostService');
      return cached;
    }

    const post = await this.postRepository.findByIdWithAuthor(id);

    if (!post) {
      this.logger.warn(`Post not found: ${id}`, 'PostService');
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    const result = this.toPostResponseDto(post);
    await this.cacheService.set(cacheKey, result);
    this.logger.log(`Post fetched and cached: ${id}`, 'PostService');

    return result;
  }

  async create(dto: CreatePostDto, authorId: string): Promise<PostResponseDto> {
    const post = await this.postRepository.createPost({
      title: dto.title,
      content: dto.content,
      published: dto.published ?? false,
      authorId,
    });

    this.logger.log(
      `Post created: ${post.id} by user: ${authorId}`,
      'PostService',
    );

    await this.invalidateListCache();
    return this.toPostResponseDto(post);
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    userId: string,
    userRoles: string[],
  ): Promise<PostResponseDto> {
    const existing = await this.postRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    if (existing.authorId !== userId && !userRoles.includes('ADMIN')) {
      this.logger.warn(
        `Unauthorized update attempt on post ${id} by user ${userId}`,
        'PostService',
      );
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const updated = await this.postRepository.updatePost(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.published !== undefined && { published: dto.published }),
    });

    this.logger.log(`Post updated: ${id} by user: ${userId}`, 'PostService');

    await this.invalidatePostCache(id);
    await this.invalidateListCache();

    return this.toPostResponseDto(updated);
  }

  async remove(
    id: string,
    userId: string,
    userRoles: string[],
  ): Promise<{ message: string }> {
    const existing = await this.postRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    if (existing.authorId !== userId && !userRoles.includes('ADMIN')) {
      this.logger.warn(
        `Unauthorized delete attempt on post ${id} by user ${userId}`,
        'PostService',
      );
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.postRepository.deletePost(id);

    this.logger.log(`Post deleted: ${id} by user: ${userId}`, 'PostService');

    await this.invalidatePostCache(id);
    await this.invalidateListCache();

    return { message: `Post "${id}" successfully deleted` };
  }
}
