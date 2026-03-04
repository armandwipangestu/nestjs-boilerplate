import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostService } from '../post.service';
import { PostRepository, PostWithAuthor } from '../post.repository';
import { CacheService } from '../../common/cache/cache.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryDto } from '../dto/post-query.dto';
import { PostListResponseDto, PostResponseDto } from '../dto/post-response.dto';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockPostWithAuthor: PostWithAuthor = {
  id: 'post-id-1',
  title: 'Test Post',
  content: 'This is test content',
  published: true,
  authorId: 'user-id-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  author: {
    id: 'user-id-1',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
  },
};

const mockPostResponseDto: PostResponseDto = {
  id: 'post-id-1',
  title: 'Test Post',
  content: 'This is test content',
  published: true,
  authorId: 'user-id-1',
  author: {
    id: 'user-id-1',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPostRepository = {
  findMany: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  findByIdWithAuthor: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PostRepository, useValue: mockPostRepository },
        { provide: CacheService, useValue: mockCacheService },
        { provide: CustomLoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    jest.clearAllMocks();
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    const query: PostQueryDto = { page: 1, limit: 10 };

    it('should return cached result when cache hit', async () => {
      const cached: PostListResponseDto = {
        data: [mockPostResponseDto],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      mockCacheService.get.mockResolvedValue(cached);

      const result = await service.findAll(query);

      expect(result).toBe(cached);
      expect(mockPostRepository.findMany).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Cache HIT'),
        'PostService',
      );
    });

    it('should fetch from repository when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPostRepository.findMany).toHaveBeenCalled();
      expect(mockPostRepository.count).toHaveBeenCalled();
    });

    it('should set cache after fetching from repository', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should apply search filter', async () => {
      const searchQuery: PostQueryDto = { page: 1, limit: 10, search: 'test' };
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(1);

      await service.findAll(searchQuery);

      const whereArg = mockPostRepository.findMany.mock.calls[0][0];
      expect(whereArg).toHaveProperty('OR');
    });

    it('should filter by published status', async () => {
      const publishedQuery: PostQueryDto = {
        page: 1,
        limit: 10,
        published: true,
      };
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(1);

      await service.findAll(publishedQuery);

      const whereArg = mockPostRepository.findMany.mock.calls[0][0];
      expect(whereArg).toHaveProperty('published', true);
    });

    it('should restrict non-admin users to published posts only', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(1);

      await service.findAll(query, false);

      const whereArg = mockPostRepository.findMany.mock.calls[0][0];
      expect(whereArg).toHaveProperty('published', true);
    });

    it('should allow admin users to see all posts', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(1);

      await service.findAll(query, true);

      const whereArg = mockPostRepository.findMany.mock.calls[0][0];
      expect(whereArg).not.toHaveProperty('published');
    });

    it('should return correct pagination meta', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findMany.mockResolvedValue([mockPostWithAuthor]);
      mockPostRepository.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPrevPage).toBe(true);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return post from cache when cache hit', async () => {
      mockCacheService.get.mockResolvedValue(mockPostResponseDto);

      const result = await service.findOne('post-id-1');

      expect(result).toBe(mockPostResponseDto);
      expect(mockPostRepository.findByIdWithAuthor).not.toHaveBeenCalled();
    });

    it('should fetch from repository when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findByIdWithAuthor.mockResolvedValue(
        mockPostWithAuthor,
      );

      await service.findOne('post-id-1');

      expect(mockPostRepository.findByIdWithAuthor).toHaveBeenCalledWith(
        'post-id-1',
      );
    });

    it('should set cache after fetching from repository', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findByIdWithAuthor.mockResolvedValue(
        mockPostWithAuthor,
      );

      await service.findOne('post-id-1');

      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPostRepository.findByIdWithAuthor.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: CreatePostDto = {
      title: 'New Post',
      content: 'New content',
      published: true,
    };

    it('should create post via repository', async () => {
      mockPostRepository.createPost.mockResolvedValue(mockPostWithAuthor);

      await service.create(dto, 'user-id-1');

      expect(mockPostRepository.createPost).toHaveBeenCalledWith({
        title: dto.title,
        content: dto.content,
        published: dto.published,
        authorId: 'user-id-1',
      });
    });

    it('should default published to false if not provided', async () => {
      mockPostRepository.createPost.mockResolvedValue(mockPostWithAuthor);

      await service.create({ ...dto, published: undefined }, 'user-id-1');

      const callArg = mockPostRepository.createPost.mock.calls[0][0];
      expect(callArg.published).toBe(false);
    });

    it('should invalidate list cache after creation', async () => {
      mockPostRepository.createPost.mockResolvedValue(mockPostWithAuthor);

      await service.create(dto, 'user-id-1');

      expect(mockCacheService.reset).toHaveBeenCalled();
    });

    it('should return created post as response DTO', async () => {
      mockPostRepository.createPost.mockResolvedValue(mockPostWithAuthor);

      const result = await service.create(dto, 'user-id-1');

      expect(result).toEqual(expect.objectContaining(mockPostResponseDto));
    });

    it('should log post creation', async () => {
      mockPostRepository.createPost.mockResolvedValue(mockPostWithAuthor);

      await service.create(dto, 'user-id-1');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Post created'),
        'PostService',
      );
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto: UpdatePostDto = { title: 'Updated Title' };

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', dto, 'user-id-1', ['USER']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);

      await expect(
        service.update('post-id-1', dto, 'different-user', ['USER']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow post author to update their own post', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.updatePost.mockResolvedValue(mockPostWithAuthor);

      await service.update('post-id-1', dto, 'user-id-1', ['USER']);

      expect(mockPostRepository.updatePost).toHaveBeenCalled();
    });

    it('should allow admin to update any post', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.updatePost.mockResolvedValue(mockPostWithAuthor);

      await service.update('post-id-1', dto, 'admin-user', ['ADMIN']);

      expect(mockPostRepository.updatePost).toHaveBeenCalled();
    });

    it('should update post via repository', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.updatePost.mockResolvedValue(mockPostWithAuthor);

      await service.update('post-id-1', dto, 'user-id-1', ['USER']);

      expect(mockPostRepository.updatePost).toHaveBeenCalledWith(
        'post-id-1',
        expect.any(Object),
      );
    });

    it('should invalidate cache after update', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.updatePost.mockResolvedValue(mockPostWithAuthor);

      await service.update('post-id-1', dto, 'user-id-1', ['USER']);

      expect(mockCacheService.del).toHaveBeenCalled();
      expect(mockCacheService.reset).toHaveBeenCalled();
    });

    it('should only include changed fields in update', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.updatePost.mockResolvedValue(mockPostWithAuthor);

      await service.update('post-id-1', { title: 'New Title' }, 'user-id-1', [
        'USER',
      ]);

      const updateArg = mockPostRepository.updatePost.mock.calls[0][1];
      expect(updateArg).toEqual({ title: 'New Title' });
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'user-id-1', ['USER']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);

      await expect(
        service.remove('post-id-1', 'different-user', ['USER']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow post author to delete their own post', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.deletePost.mockResolvedValue(undefined);

      await service.remove('post-id-1', 'user-id-1', ['USER']);

      expect(mockPostRepository.deletePost).toHaveBeenCalledWith('post-id-1');
    });

    it('should allow admin to delete any post', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.deletePost.mockResolvedValue(undefined);

      await service.remove('post-id-1', 'admin-user', ['ADMIN']);

      expect(mockPostRepository.deletePost).toHaveBeenCalledWith('post-id-1');
    });

    it('should invalidate cache after deletion', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.deletePost.mockResolvedValue(undefined);

      await service.remove('post-id-1', 'user-id-1', ['USER']);

      expect(mockCacheService.del).toHaveBeenCalled();
      expect(mockCacheService.reset).toHaveBeenCalled();
    });

    it('should return success message', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPostWithAuthor);
      mockPostRepository.deletePost.mockResolvedValue(undefined);

      const result = await service.remove('post-id-1', 'user-id-1', ['USER']);

      expect(result.message).toContain('post-id-1');
      expect(result.message).toContain('successfully deleted');
    });
  });
});
