import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { CustomLoggerService } from '../common/logger/logger.service';
import { AppConfigService } from '../config/app-config.service';
import { RegisterDto } from './dto/register.dto';
import { UserWithAcl, UserWithAclRelations } from './interfaces/auth.interface';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUserWithAclRelations: UserWithAclRelations = {
  id: 'user-id-1',
  email: 'test@example.com',
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  avatarUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  roles: [
    {
      userId: 'user-id-1',
      roleId: 'role-id-1',
      role: {
        id: 'role-id-1',
        name: 'USER',
        permissions: [
          {
            roleId: 'role-id-1',
            permissionId: 'perm-id-1',
            permission: {
              id: 'perm-id-1',
              name: 'view-posts',
            },
          },
        ],
      },
    },
  ],
  permissions: [],
};

const mockUserWithAcl: UserWithAcl = {
  id: 'user-id-1',
  email: 'test@example.com',
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  avatarUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  roles: ['USER'],
  permissions: ['view-posts'],
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAuthRepository = {
  findUserByEmailWithAcl: jest.fn(),
  findUserByIdWithAcl: jest.fn(),
  findUserByEmailOrUsername: jest.fn(),
  createUser: jest.fn(),
  createRefreshToken: jest.fn(),
  findRefreshTokensByUserId: jest.fn(),
  deleteRefreshTokensByUserId: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const mockAppConfig = {
  jwt: {
    secret: 'test-secret',
    expiration: '15m',
    refreshSecret: 'test-refresh-secret',
    refreshExpiration: '7d',
  },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CustomLoggerService, useValue: mockLogger },
        { provide: AppConfigService, useValue: mockAppConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── validateUser ─────────────────────────────────────────────────────────

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUserWithAclRelations, isActive: false };
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(inactiveUser);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow('User account is inactive');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(
        mockUserWithAclRelations,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user with ACL if credentials are valid', async () => {
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(
        mockUserWithAclRelations,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(expect.objectContaining(mockUserWithAcl));
      expect(result.roles).toContain('USER');
    });

    it('should log successful login', async () => {
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(
        mockUserWithAclRelations,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser('test@example.com', 'password');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('logged in'),
        'Auth',
      );
    });
  });

  // ─── getUserWithAclByEmail ────────────────────────────────────────────────

  describe('getUserWithAclByEmail', () => {
    it('should return null if user not found', async () => {
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(null);

      const result = await service.getUserWithAclByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });

    it('should return user with ACL if found', async () => {
      mockAuthRepository.findUserByEmailWithAcl.mockResolvedValue(
        mockUserWithAclRelations,
      );

      const result = await service.getUserWithAclByEmail('test@example.com');

      expect(result).toEqual(expect.objectContaining(mockUserWithAcl));
      expect(result?.roles).toContain('USER');
    });
  });

  // ─── getUserWithAclById ───────────────────────────────────────────────────

  describe('getUserWithAclById', () => {
    it('should return null if user not found', async () => {
      mockAuthRepository.findUserByIdWithAcl.mockResolvedValue(null);

      const result = await service.getUserWithAclById('user-id-1');

      expect(result).toBeNull();
    });

    it('should return user with ACL if found', async () => {
      mockAuthRepository.findUserByIdWithAcl.mockResolvedValue(
        mockUserWithAclRelations,
      );

      const result = await service.getUserWithAclById('user-id-1');

      expect(result).toEqual(expect.objectContaining(mockUserWithAcl));
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should generate access token', async () => {
      mockJwtService.sign.mockReturnValue('access-token');
      mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);

      await service.login(mockUserWithAcl);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUserWithAcl.id,
          email: mockUserWithAcl.email,
        }),
        expect.objectContaining({ secret: 'test-secret' }),
      );
    });

    it('should generate refresh token', async () => {
      mockJwtService.sign.mockReturnValue('refresh-token');
      mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);

      await service.login(mockUserWithAcl);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ secret: 'test-refresh-secret' }),
      );
    });

    it('should store hashed refresh token in database', async () => {
      mockJwtService.sign.mockReturnValue('refresh-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
      mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);

      await service.login(mockUserWithAcl);

      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalledWith(
        mockUserWithAcl.id,
        'hashed-token',
        expect.any(Date),
      );
    });

    it('should return login response with tokens and user', async () => {
      mockJwtService.sign.mockReturnValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
      mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(mockUserWithAcl);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(mockUserWithAcl);
    });
  });

  // ─── refreshAccessToken ───────────────────────────────────────────────────

  describe('refreshAccessToken', () => {
    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token not in database', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1' });
      mockAuthRepository.findRefreshTokensByUserId.mockResolvedValue([]);

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if stored token is expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1' });
      mockAuthRepository.findRefreshTokensByUserId.mockResolvedValue([
        {
          id: 'token-id',
          userId: 'user-id-1',
          token: 'hashed-token',
          expiresAt: expiredDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1' });
      mockAuthRepository.findRefreshTokensByUserId.mockResolvedValue([
        {
          id: 'token-id',
          userId: 'user-id-1',
          token: 'hashed-token',
          expiresAt: futureDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockAuthRepository.findUserByIdWithAcl.mockResolvedValue(null);

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new access token for valid refresh token', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1' });
      mockAuthRepository.findRefreshTokensByUserId.mockResolvedValue([
        {
          id: 'token-id',
          userId: 'user-id-1',
          token: 'hashed-token',
          expiresAt: futureDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockAuthRepository.findUserByIdWithAcl.mockResolvedValue(
        mockUserWithAclRelations,
      );
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshAccessToken('refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete refresh tokens for user', async () => {
      mockAuthRepository.deleteRefreshTokensByUserId.mockResolvedValue(
        undefined,
      );

      await service.logout('user-id-1', 'test@example.com');

      expect(
        mockAuthRepository.deleteRefreshTokensByUserId,
      ).toHaveBeenCalledWith('user-id-1');
    });

    it('should log logout event', async () => {
      mockAuthRepository.deleteRefreshTokensByUserId.mockResolvedValue(
        undefined,
      );

      await service.logout('user-id-1', 'test@example.com');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('logged out'),
        'Auth',
      );
    });
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should throw BadRequestException if email already exists', async () => {
      mockAuthRepository.findUserByEmailOrUsername.mockResolvedValue(
        mockUserWithAclRelations,
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if username already exists', async () => {
      mockAuthRepository.findUserByEmailOrUsername.mockResolvedValue(
        mockUserWithAclRelations,
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should hash password before creating user', async () => {
      mockAuthRepository.findUserByEmailOrUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockAuthRepository.createUser.mockResolvedValue(mockUserWithAclRelations);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create user with correct data', async () => {
      mockAuthRepository.findUserByEmailOrUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockAuthRepository.createUser.mockResolvedValue(mockUserWithAclRelations);

      await service.register(registerDto);

      expect(mockAuthRepository.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        username: registerDto.username,
        password: 'hashed-password',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
    });

    it('should return user auth data without password', async () => {
      mockAuthRepository.findUserByEmailOrUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockAuthRepository.createUser.mockResolvedValue(mockUserWithAclRelations);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('permissions');
      expect(result).not.toHaveProperty('password');
    });

    it('should log user registration', async () => {
      mockAuthRepository.findUserByEmailOrUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockAuthRepository.createUser.mockResolvedValue(mockUserWithAclRelations);

      await service.register(registerDto);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('registered'),
        'Auth',
      );
    });
  });
});
