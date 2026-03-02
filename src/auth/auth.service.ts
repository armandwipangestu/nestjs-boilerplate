import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CustomLoggerService } from '../common/logger/logger.service';
import { RefreshToken } from '@prisma/client';
import ms from 'ms';
import { AppConfigService } from '../config/app-config.service';
import type {
  AuthUser,
  JwtPayload,
  LoginResponse,
  UserWithAclRelations,
  UserWithAcl,
} from './interfaces/auth.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: CustomLoggerService,
    private appConfig: AppConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithAcl> {
    const user = await this.getUserWithAclByEmail(email);

    if (!user) {
      this.logger.warn(
        `Login attempt with non-existent email: ${email}`,
        'Auth',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn(`Login attempt with inactive user: ${email}`, 'Auth');
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Failed to login attempt for user: ${email}`, 'Auth');
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${email}`, 'Auth');

    return user;
  }

  async getUserWithAclByEmail(email: string): Promise<UserWithAcl | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) return null;

    return this.mapUserAcl(user);
  }

  async getUserWithAclById(id: string): Promise<UserWithAcl | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) return null;

    return this.mapUserAcl(user);
  }

  private mapUserAcl(user: UserWithAclRelations): UserWithAcl {
    const roles = user.roles.map((ur) => ur.role.name);
    const rolePermissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.name),
    );
    const directPermissions = user.permissions.map((up) => up.permission.name);

    const permissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ];

    return {
      ...user,
      roles,
      permissions,
    };
  }

  async login(user: AuthUser): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.appConfig.jwt.secret,
      expiresIn: this.appConfig.jwt.expiration,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.appConfig.jwt.refreshSecret,
      expiresIn: this.appConfig.jwt.refreshExpiration,
    });

    // Store refresh token in database
    const expiresAt = new Date(
      Date.now() + ms(this.appConfig.jwt.refreshExpiration),
    );

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshAccessToken(
    refreshTokenValue: string,
  ): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshTokenValue, {
        secret: this.appConfig.jwt.refreshSecret,
      });

      // Verify token exists in database
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          expiresAt: { gt: new Date() },
        },
      });

      let matchedToken: RefreshToken | null = null;

      for (const tokenRecord of storedTokens) {
        const isMatch = await bcrypt.compare(
          refreshTokenValue,
          tokenRecord.token,
        );
        if (isMatch) {
          matchedToken = tokenRecord;
          break;
        }
      }

      if (!matchedToken || matchedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired or invalid');
      }

      const user = await this.getUserWithAclById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.appConfig.jwt.secret,
        expiresIn: this.appConfig.jwt.expiration,
      });

      this.logger.debug(
        `Token refreshed successfully for: ${user.email}`,
        'Auth',
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Invalid refresh token`, errorMessage, 'Auth');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, email: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });

    this.logger.log(`User logged out: ${email}`, 'Auth');
  }

  async register(data: RegisterDto): Promise<AuthUser> {
    const { email, password, username, firstName, lastName } = data;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email or username already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        roles: {
          create: {
            role: {
              connect: {
                name: 'USER',
              },
            },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    this.logger.log(`User registered: ${email}`, 'Auth');

    const mappedUser = this.mapUserAcl(user);

    return {
      id: mappedUser.id,
      email: mappedUser.email,
      username: mappedUser.username,
      roles: mappedUser.roles,
      permissions: mappedUser.permissions,
    };
  }
}
