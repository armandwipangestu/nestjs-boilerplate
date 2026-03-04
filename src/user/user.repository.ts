import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserWithAclRelations } from '../auth/interfaces/auth.interface';

@Injectable()
export class UserRepository {
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

  async findManyWithAcl(
    where: Prisma.UserWhereInput,
    skip: number,
    take: number,
  ): Promise<UserWithAclRelations[]> {
    return (await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: this.userAclInclude,
    })) as UserWithAclRelations[];
  }

  async count(where: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async findByIdWithAcl(id: string): Promise<UserWithAclRelations | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      include: this.userAclInclude,
    })) as UserWithAclRelations | null;
  }

  async findByEmailOrUsername(
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

  async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<UserWithAclRelations> {
    return (await this.prisma.user.create({
      data,
      include: this.userAclInclude,
    })) as UserWithAclRelations;
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithAclRelations> {
    return (await this.prisma.user.update({
      where: { id },
      data,
      include: this.userAclInclude,
    })) as UserWithAclRelations;
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async updateAvatar(
    id: string,
    avatarUrl: string,
  ): Promise<UserWithAclRelations> {
    return (await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      include: this.userAclInclude,
    })) as UserWithAclRelations;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
