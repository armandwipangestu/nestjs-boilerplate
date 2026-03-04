import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository, PostWithAuthor } from '../post.repository';
import { PrismaService } from '../../prisma/prisma.service';

// ─── Mock PrismaService ───────────────────────────────────────────────────────

const mockPrismaPost = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockPrismaService = {
  post: mockPrismaPost,
};

// ─── Shared Fixtures ──────────────────────────────────────────────────────────

const authorSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
};

const basePost: PostWithAuthor = {
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

const expectedInclude = {
  author: { select: authorSelect },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('PostRepository', () => {
  let repository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PostRepository>(PostRepository);
    jest.clearAllMocks();
  });

  // ─── findMany ─────────────────────────────────────────────────────────────

  describe('findMany', () => {
    it('should call prisma.post.findMany with where, skip, take, orderBy, and author include', async () => {
      mockPrismaPost.findMany.mockResolvedValue([basePost]);

      const where = { published: true };
      await repository.findMany(where, 0, 10);

      expect(mockPrismaPost.findMany).toHaveBeenCalledWith({
        where,
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expectedInclude,
      });
    });

    it('should return the list of posts with author', async () => {
      mockPrismaPost.findMany.mockResolvedValue([basePost]);

      const result = await repository.findMany({}, 0, 10);

      expect(result).toEqual([basePost]);
      expect(result[0].author).toBeDefined();
    });

    it('should handle pagination correctly', async () => {
      mockPrismaPost.findMany.mockResolvedValue([basePost]);

      await repository.findMany({}, 20, 10);

      expect(mockPrismaPost.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 20,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expectedInclude,
      });
    });

    it('should apply where filter', async () => {
      mockPrismaPost.findMany.mockResolvedValue([basePost]);

      const where = { published: true, authorId: 'user-id-1' };
      await repository.findMany(where, 0, 10);

      expect(mockPrismaPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where }),
      );
    });
  });

  // ─── count ────────────────────────────────────────────────────────────────

  describe('count', () => {
    it('should call prisma.post.count with the where clause', async () => {
      mockPrismaPost.count.mockResolvedValue(5);

      const where = { published: true };
      const result = await repository.count(where);

      expect(mockPrismaPost.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(5);
    });

    it('should return zero when no posts match', async () => {
      mockPrismaPost.count.mockResolvedValue(0);

      const result = await repository.count({ published: false });

      expect(result).toBe(0);
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should call prisma.post.findUnique with the id', async () => {
      mockPrismaPost.findUnique.mockResolvedValue(basePost);

      await repository.findById('post-id-1');

      expect(mockPrismaPost.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
      });
    });

    it('should return the post without author', async () => {
      const postWithoutAuthor = { ...basePost };
      delete (postWithoutAuthor as any).author;
      mockPrismaPost.findUnique.mockResolvedValue(postWithoutAuthor);

      const result = await repository.findById('post-id-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('post-id-1');
    });

    it('should return null when post is not found', async () => {
      mockPrismaPost.findUnique.mockResolvedValue(null);

      const result = await repository.findById('missing-id');

      expect(result).toBeNull();
    });
  });

  // ─── findByIdWithAuthor ───────────────────────────────────────────────────

  describe('findByIdWithAuthor', () => {
    it('should call prisma.post.findUnique with id and author include', async () => {
      mockPrismaPost.findUnique.mockResolvedValue(basePost);

      await repository.findByIdWithAuthor('post-id-1');

      expect(mockPrismaPost.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
        include: expectedInclude,
      });
    });

    it('should return the post with author', async () => {
      mockPrismaPost.findUnique.mockResolvedValue(basePost);

      const result = await repository.findByIdWithAuthor('post-id-1');

      expect(result).toEqual(basePost);
      expect(result?.author).toBeDefined();
      expect(result?.author.username).toBe('johndoe');
    });

    it('should return null when post is not found', async () => {
      mockPrismaPost.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithAuthor('missing-id');

      expect(result).toBeNull();
    });
  });

  // ─── createPost ───────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('should call prisma.post.create with data and author include', async () => {
      mockPrismaPost.create.mockResolvedValue(basePost);

      const data = {
        title: 'New Post',
        content: 'New content',
        published: true,
        authorId: 'user-id-1',
      };

      await repository.createPost(data);

      expect(mockPrismaPost.create).toHaveBeenCalledWith({
        data,
        include: expectedInclude,
      });
    });

    it('should return the created post with author', async () => {
      mockPrismaPost.create.mockResolvedValue(basePost);

      const data = {
        title: 'New Post',
        content: 'New content',
        published: true,
        authorId: 'user-id-1',
      };

      const result = await repository.createPost(data);

      expect(result).toEqual(basePost);
      expect(result.author).toBeDefined();
    });

    it('should create post with all data fields', async () => {
      mockPrismaPost.create.mockResolvedValue(basePost);

      const data = {
        title: 'Test Title',
        content: 'Test Content',
        published: false,
        authorId: 'user-id-123',
      };

      await repository.createPost(data);

      const createArg = mockPrismaPost.create.mock.calls[0][0];
      expect(createArg.data).toEqual(data);
    });
  });

  // ─── updatePost ───────────────────────────────────────────────────────────

  describe('updatePost', () => {
    it('should call prisma.post.update with correct id, data, and author include', async () => {
      const updatedPost = { ...basePost, title: 'Updated Title' };
      mockPrismaPost.update.mockResolvedValue(updatedPost);

      const data = { title: 'Updated Title' };
      await repository.updatePost('post-id-1', data);

      expect(mockPrismaPost.update).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
        data,
        include: expectedInclude,
      });
    });

    it('should return the updated post with author', async () => {
      const updatedPost = { ...basePost, title: 'Updated Title' };
      mockPrismaPost.update.mockResolvedValue(updatedPost);

      const result = await repository.updatePost('post-id-1', {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
      expect(result.author).toBeDefined();
    });

    it('should support partial updates', async () => {
      const updatedPost = { ...basePost, published: false };
      mockPrismaPost.update.mockResolvedValue(updatedPost);

      const partialData = { published: false };
      await repository.updatePost('post-id-1', partialData);

      const updateArg = mockPrismaPost.update.mock.calls[0][0];
      expect(updateArg.data).toEqual(partialData);
    });
  });

  // ─── deletePost ───────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('should call prisma.post.delete with the correct id', async () => {
      mockPrismaPost.delete.mockResolvedValue(basePost);

      await repository.deletePost('post-id-1');

      expect(mockPrismaPost.delete).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
      });
    });

    it('should resolve without returning a value', async () => {
      mockPrismaPost.delete.mockResolvedValue(basePost);

      const result = await repository.deletePost('post-id-1');

      expect(result).toBeUndefined();
    });

    it('should delete post by id', async () => {
      mockPrismaPost.delete.mockResolvedValue(basePost);

      await repository.deletePost('post-id-123');

      const deleteArg = mockPrismaPost.delete.mock.calls[0][0];
      expect(deleteArg.where.id).toBe('post-id-123');
    });
  });
});
