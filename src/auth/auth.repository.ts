import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshToken } from '@prisma/client';
import { UserWithAclRelations } from './interfaces/auth.interface';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userAclInclude = {
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
  };

  // ─── User ─────────────────────────────────────────────────────────────────

  async findUserByEmailWithAcl(
    email: string,
  ): Promise<UserWithAclRelations | null> {
    return (await this.prisma.user.findUnique({
      where: { email },
      include: this.userAclInclude,
    })) as UserWithAclRelations | null;
  }

  async findUserByIdWithAcl(id: string): Promise<UserWithAclRelations | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      include: this.userAclInclude,
    })) as UserWithAclRelations | null;
  }

  async findUserByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<UserWithAclRelations | null> {
    return (await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      include: this.userAclInclude,
    })) as UserWithAclRelations | null;
  }

  async createUser(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserWithAclRelations> {
    return (await this.prisma.user.create({
      data: {
        ...data,
        roles: {
          create: {
            role: {
              connect: { name: 'USER' },
            },
          },
        },
      },
      include: this.userAclInclude,
    })) as UserWithAclRelations;
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────

  async createRefreshToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { token: hashedToken, userId, expiresAt },
    });
  }

  async findRefreshTokensByUserId(userId: string): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async deleteRefreshTokensByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
