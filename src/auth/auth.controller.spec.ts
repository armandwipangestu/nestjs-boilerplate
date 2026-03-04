import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppConfigService } from '../config/app-config.service';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserWithAcl, JwtPayload } from './interfaces/auth.interface';
import type { Response } from 'express';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUser: UserWithAcl = {
  id: 'user-id-1',
  email: 'test@example.com',
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: ['USER'],
  permissions: ['view-posts'],
};

const mockJwtPayload: JwtPayload = {
  sub: 'user-id-1',
  email: 'test@example.com',
  username: 'testuser',
  roles: ['USER'],
  permissions: ['view-posts'],
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAuthService = {
  register: jest.fn(),
  validateUser: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  logout: jest.fn(),
};

const mockAppConfig = {
  env: {
    cookieSecure: true,
  },
  jwt: {
    refreshExpiration: '7d',
  },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppConfigService, useValue: mockAppConfig },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
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

    it('should call authService.register with registerDto', async () => {
      authService.register.mockResolvedValue({
        id: 'user-id-2',
        email: registerDto.email,
        username: registerDto.username,
        roles: ['USER'],
        permissions: [],
      });

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return user response without password', async () => {
      authService.register.mockResolvedValue({
        id: 'user-id-2',
        email: registerDto.email,
        username: registerDto.username,
        roles: ['USER'],
        permissions: [],
      });

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).not.toHaveProperty('password');
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should validate user credentials', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      });

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      await controller.login(loginDto, mockRes);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should call authService.login with validated user', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      });

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      await controller.login(loginDto, mockRes);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should set refresh token in httpOnly cookie', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      });

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      await controller.login(loginDto, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        }),
      );
    });

    it('should return auth response with accessToken and user', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      });

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockRes);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          roles: mockUser.roles,
          permissions: mockUser.permissions,
        }),
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      authService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(controller.login(loginDto, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── refresh ──────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should throw UnauthorizedException if refreshToken cookie is missing', async () => {
      const mockReq = {
        cookies: {},
      };

      await expect(controller.refresh(mockReq as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.refresh(mockReq as any)).rejects.toThrow(
        'Refresh token not found',
      );
    });

    it('should call authService.refreshAccessToken with refresh token', async () => {
      authService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const mockReq = {
        cookies: { refreshToken: 'refresh-token' },
      };

      await controller.refresh(mockReq as any);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        'refresh-token',
      );
    });

    it('should return new access token', async () => {
      authService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const mockReq = {
        cookies: { refreshToken: 'refresh-token' },
      };

      const result = await controller.refresh(mockReq as any);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      authService.refreshAccessToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      const mockReq = {
        cookies: { refreshToken: 'invalid-token' },
      };

      await expect(controller.refresh(mockReq as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should call authService.logout with user sub and email', async () => {
      authService.logout.mockResolvedValue(undefined);

      await controller.logout(mockJwtPayload);

      expect(authService.logout).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.email,
      );
    });

    it('should return success message', async () => {
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockJwtPayload);

      expect(result).toHaveProperty('message');
      expect(result.message.toLowerCase()).toContain('logged out');
    });
  });
});
