import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { CacheService } from '../../common/cache/cache.service';
import { StorageService } from '../../common/storage/storage.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeUserWithAcl = (overrides: Record<string, any> = {}) => ({
  id: 'user-id-1',
  email: 'john@example.com',
  username: 'johndoe',
  password: '$2b$10$hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  avatarUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  roles: [
    {
      role: {
        name: 'USER',
        permissions: [{ permission: { name: 'index-user' } }],
      },
    },
  ],
  permissions: [],
  ...overrides,
});

const makeUserResponseDto = (overrides: Record<string, any> = {}) => ({
  id: 'user-id-1',
  email: 'john@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  avatarUrl: null,
  roles: ['USER'],
  permissions: ['index-user'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserRepository = {
  findManyWithAcl: jest.fn(),
  count: jest.fn(),
  findByIdWithAcl: jest.fn(),
  findById: jest.fn(),
  findByEmailOrUsername: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  updateAvatar: jest.fn(),
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

const mockStorageService = {
  upload: jest.fn(),
  delete: jest.fn(),
  getUrl: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: CacheService, useValue: mockCacheService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: CustomLoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
    mockStorageService.getUrl.mockImplementation((url: string) => url);
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    const query: UserQueryDto = { page: 1, limit: 10 };

    it('should return cached result when cache hit', async () => {
      const cached = { data: [makeUserResponseDto()], meta: {} };
      mockCacheService.get.mockResolvedValue(cached);

      const result = await service.findAll(query);

      expect(result).toBe(cached);
      expect(mockUserRepository.findManyWithAcl).not.toHaveBeenCalled();
    });

    it('should fetch from repository when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findManyWithAcl.mockResolvedValue([makeUserWithAcl()]);
      mockUserRepository.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockUserRepository.findManyWithAcl).toHaveBeenCalled();
      expect(mockUserRepository.count).toHaveBeenCalled();
    });

    it('should set cache after fetching from repository', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findManyWithAcl.mockResolvedValue([makeUserWithAcl()]);
      mockUserRepository.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should apply search and isActive filter', async () => {
      const searchQuery: UserQueryDto = {
        page: 1,
        limit: 10,
        search: 'john',
        isActive: true,
      };
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findManyWithAcl.mockResolvedValue([]);
      mockUserRepository.count.mockResolvedValue(0);

      await service.findAll(searchQuery);

      const whereArg = mockUserRepository.findManyWithAcl.mock.calls[0][0];
      expect(whereArg).toHaveProperty('OR');
      expect(whereArg).toHaveProperty('isActive', true);
    });

    it('should return correct pagination meta', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findManyWithAcl.mockResolvedValue([makeUserWithAcl()]);
      mockUserRepository.count.mockResolvedValue(25);

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
    it('should return user from cache when cache hit', async () => {
      const cached = makeUserResponseDto();
      mockCacheService.get.mockResolvedValue(cached);

      const result = await service.findOne('user-id-1');

      expect(result).toBe(cached);
      expect(mockUserRepository.findByIdWithAcl).not.toHaveBeenCalled();
    });

    it('should fetch from repository when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findByIdWithAcl.mockResolvedValue(makeUserWithAcl());

      await service.findOne('user-id-1');

      expect(mockUserRepository.findByIdWithAcl).toHaveBeenCalledWith(
        'user-id-1',
      );
    });

    it('should set cache after fetching from repository', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findByIdWithAcl.mockResolvedValue(makeUserWithAcl());

      await service.findOne('user-id-1');

      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findByIdWithAcl.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: CreateUserDto = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should throw ConflictException when email or username already exists', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(
        makeUserWithAcl(),
      );

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should hash password before creating the user', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(makeUserWithAcl());

      await service.create(dto);

      const createArg = mockUserRepository.createUser.mock.calls[0][0];
      expect(createArg.password).not.toBe('password123');
      expect(createArg.password).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should create user via repository', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(makeUserWithAcl());

      await service.create(dto);

      expect(mockUserRepository.createUser).toHaveBeenCalled();
    });

    it('should reset cache after creating user', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(makeUserWithAcl());

      await service.create(dto);

      expect(mockCacheService.reset).toHaveBeenCalled();
    });

    it('should default to USER role when no roles specified', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(makeUserWithAcl());

      await service.create({ ...dto, roles: undefined });

      const createArg = mockUserRepository.createUser.mock.calls[0][0];
      expect(createArg.roles.create.role.connect.name).toBe('USER');
    });

    it('should assign specified roles when provided', async () => {
      mockUserRepository.findByEmailOrUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(makeUserWithAcl());

      await service.create({ ...dto, roles: ['ADMIN', 'USER'] });

      const createArg = mockUserRepository.createUser.mock.calls[0][0];
      expect(Array.isArray(createArg.roles.create)).toBe(true);
      expect(createArg.roles.create).toHaveLength(2);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto: UpdateUserDto = { firstName: 'Jane' };

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update user via repository', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());
      mockUserRepository.updateUser.mockResolvedValue(
        makeUserWithAcl({ firstName: 'Jane' }),
      );

      await service.update('user-id-1', dto);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        'user-id-1',
        expect.any(Object),
      );
    });

    it('should hash password if provided in update', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());
      mockUserRepository.updateUser.mockResolvedValue(makeUserWithAcl());

      await service.update('user-id-1', { password: 'newpassword123' });

      const updateArg = mockUserRepository.updateUser.mock.calls[0][1];
      expect(updateArg.password).not.toBe('newpassword123');
      expect(updateArg.password).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should not include password in update data if not provided', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());
      mockUserRepository.updateUser.mockResolvedValue(makeUserWithAcl());

      await service.update('user-id-1', { firstName: 'Jane' });

      const updateArg = mockUserRepository.updateUser.mock.calls[0][1];
      expect(updateArg.password).toBeUndefined();
    });

    it('should invalidate user cache after updating', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());
      mockUserRepository.updateUser.mockResolvedValue(makeUserWithAcl());

      await service.update('user-id-1', dto);

      expect(mockCacheService.del).toHaveBeenCalledWith('users:user-id-1');
      expect(mockCacheService.reset).toHaveBeenCalled();
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete user via repository', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());

      await service.remove('user-id-1');

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('user-id-1');
    });

    it('should delete avatar from storage if user has one', async () => {
      mockUserRepository.findById.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: 'avatars/old.jpg' }),
      );

      await service.remove('user-id-1');

      expect(mockStorageService.delete).toHaveBeenCalledWith('avatars/old.jpg');
    });

    it('should not call storage.delete if user has no avatar', async () => {
      mockUserRepository.findById.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: null }),
      );

      await service.remove('user-id-1');

      expect(mockStorageService.delete).not.toHaveBeenCalled();
    });

    it('should invalidate cache after removal', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());

      await service.remove('user-id-1');

      expect(mockCacheService.del).toHaveBeenCalledWith('users:user-id-1');
      expect(mockCacheService.reset).toHaveBeenCalled();
    });

    it('should return success message', async () => {
      mockUserRepository.findById.mockResolvedValue(makeUserWithAcl());

      const result = await service.remove('user-id-1');

      expect(result.message).toContain('user-id-1');
    });
  });

  // ─── uploadAvatar ─────────────────────────────────────────────────────────

  describe('uploadAvatar', () => {
    const file = {
      originalname: 'avatar.jpg',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.uploadAvatar('non-existent', file)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete previous avatar from storage if it exists', async () => {
      mockUserRepository.findById.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: 'avatars/old.jpg' }),
      );
      mockStorageService.upload.mockResolvedValue('avatars/new.jpg');
      mockUserRepository.updateAvatar.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: 'avatars/new.jpg' }),
      );

      await service.uploadAvatar('user-id-1', file);

      expect(mockStorageService.delete).toHaveBeenCalledWith('avatars/old.jpg');
    });

    it('should upload the new avatar and update via repository', async () => {
      mockUserRepository.findById.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: null }),
      );
      mockStorageService.upload.mockResolvedValue('avatars/new.jpg');
      mockUserRepository.updateAvatar.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: 'avatars/new.jpg' }),
      );

      await service.uploadAvatar('user-id-1', file);

      expect(mockStorageService.upload).toHaveBeenCalledWith(file);
      expect(mockUserRepository.updateAvatar).toHaveBeenCalledWith(
        'user-id-1',
        'avatars/new.jpg',
      );
    });

    it('should invalidate cache after avatar upload', async () => {
      mockUserRepository.findById.mockResolvedValue(
        makeUserWithAcl({ avatarUrl: null }),
      );
      mockStorageService.upload.mockResolvedValue('avatars/new.jpg');
      mockUserRepository.updateAvatar.mockResolvedValue(makeUserWithAcl());

      await service.uploadAvatar('user-id-1', file);

      expect(mockCacheService.del).toHaveBeenCalledWith('users:user-id-1');
    });
  });
});
