import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma/prisma.service';

// ─── Mock PrismaService ───────────────────────────────────────────────────────

const mockPrismaUser = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockPrismaService = {
  user: mockPrismaUser,
};

// ─── Shared fixture ───────────────────────────────────────────────────────────

const ACL_RELATIONS = {
  roles: [
    {
      role: {
        name: 'USER',
        permissions: [{ permission: { name: 'index-user' } }],
      },
    },
  ],
  permissions: [],
};

const baseUser = {
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
  ...ACL_RELATIONS,
};

const expectedInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  },
  permissions: {
    include: { permission: true },
  },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  // ─── findManyWithAcl ──────────────────────────────────────────────────────

  describe('findManyWithAcl', () => {
    it('should call prisma.user.findMany with where, skip, take, orderBy, and ACL include', async () => {
      mockPrismaUser.findMany.mockResolvedValue([baseUser]);

      const where = { isActive: true };
      await repository.findManyWithAcl(where, 0, 10);

      expect(mockPrismaUser.findMany).toHaveBeenCalledWith({
        where,
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expectedInclude,
      });
    });

    it('should return the list of users', async () => {
      mockPrismaUser.findMany.mockResolvedValue([baseUser]);

      const result = await repository.findManyWithAcl({}, 0, 10);

      expect(result).toEqual([baseUser]);
    });
  });

  // ─── count ────────────────────────────────────────────────────────────────

  describe('count', () => {
    it('should call prisma.user.count with the where clause', async () => {
      mockPrismaUser.count.mockResolvedValue(5);

      const where = { isActive: true };
      const result = await repository.count(where);

      expect(mockPrismaUser.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(5);
    });
  });

  // ─── findByIdWithAcl ──────────────────────────────────────────────────────

  describe('findByIdWithAcl', () => {
    it('should call prisma.user.findUnique with correct id and ACL include', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(baseUser);

      await repository.findByIdWithAcl('user-id-1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        include: expectedInclude,
      });
    });

    it('should return the user when found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(baseUser);

      const result = await repository.findByIdWithAcl('user-id-1');

      expect(result).toEqual(baseUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithAcl('missing-id');

      expect(result).toBeNull();
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should call prisma.user.findUnique with the id', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(baseUser);

      await repository.findById('user-id-1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });
  });

  // ─── findByEmailOrUsername ────────────────────────────────────────────────

  describe('findByEmailOrUsername', () => {
    it('should call prisma.user.findFirst with OR condition', async () => {
      mockPrismaUser.findFirst.mockResolvedValue(baseUser);

      await repository.findByEmailOrUsername('john@example.com', 'johndoe');

      expect(mockPrismaUser.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: 'john@example.com' }, { username: 'johndoe' }] },
        include: expectedInclude,
      });
    });

    it('should return null when no user found', async () => {
      mockPrismaUser.findFirst.mockResolvedValue(null);

      const result = await repository.findByEmailOrUsername('x@x.com', 'nope');

      expect(result).toBeNull();
    });
  });

  // ─── createUser ───────────────────────────────────────────────────────────

  describe('createUser', () => {
    it('should call prisma.user.create with data and ACL include', async () => {
      mockPrismaUser.create.mockResolvedValue(baseUser);

      const data = {
        email: 'john@example.com',
        username: 'johndoe',
        password: 'hashed',
        roles: { create: { role: { connect: { name: 'USER' } } } },
      } as any;

      await repository.createUser(data);

      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data,
        include: expectedInclude,
      });
    });

    it('should return the created user', async () => {
      mockPrismaUser.create.mockResolvedValue(baseUser);

      const result = await repository.createUser({} as any);

      expect(result).toEqual(baseUser);
    });
  });

  // ─── updateUser ───────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('should call prisma.user.update with correct id, data, and ACL include', async () => {
      const updatedUser = { ...baseUser, firstName: 'Jane' };
      mockPrismaUser.update.mockResolvedValue(updatedUser);

      const data = { firstName: 'Jane' };
      await repository.updateUser('user-id-1', data);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data,
        include: expectedInclude,
      });
    });

    it('should return the updated user', async () => {
      const updatedUser = { ...baseUser, firstName: 'Jane' };
      mockPrismaUser.update.mockResolvedValue(updatedUser);

      const result = await repository.updateUser('user-id-1', {
        firstName: 'Jane',
      });

      expect(result).toEqual(updatedUser);
    });
  });

  // ─── deleteUser ───────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should call prisma.user.delete with the correct id', async () => {
      mockPrismaUser.delete.mockResolvedValue(baseUser);

      await repository.deleteUser('user-id-1');

      expect(mockPrismaUser.delete).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });

    it('should resolve without returning a value', async () => {
      mockPrismaUser.delete.mockResolvedValue(baseUser);

      const result = await repository.deleteUser('user-id-1');

      expect(result).toBeUndefined();
    });
  });

  // ─── updateAvatar ─────────────────────────────────────────────────────────

  describe('updateAvatar', () => {
    it('should call prisma.user.update with avatarUrl and ACL include', async () => {
      const updatedUser = { ...baseUser, avatarUrl: 'avatars/new.jpg' };
      mockPrismaUser.update.mockResolvedValue(updatedUser);

      await repository.updateAvatar('user-id-1', 'avatars/new.jpg');

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { avatarUrl: 'avatars/new.jpg' },
        include: expectedInclude,
      });
    });

    it('should return the updated user with new avatarUrl', async () => {
      const updatedUser = { ...baseUser, avatarUrl: 'avatars/new.jpg' };
      mockPrismaUser.update.mockResolvedValue(updatedUser);

      const result = await repository.updateAvatar(
        'user-id-1',
        'avatars/new.jpg',
      );

      expect(result.avatarUrl).toBe('avatars/new.jpg');
    });
  });
});
