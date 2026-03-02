import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLoggerService } from '../common/logger/logger.service';
import { CacheService } from '../common/cache/cache.service';
import { StorageService } from '../common/storage/storage.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto, UserListResponseDto } from './dto/user-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import {
  UserWithAcl,
  UserWithAclRelations,
} from '../auth/interfaces/auth.interface';

const USER_CACHE_PREFIX = 'users';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
    private readonly cacheService: CacheService,
    private readonly storage: StorageService,
  ) {}

  private userCacheKey(id: string): string {
    return `${USER_CACHE_PREFIX}:${id}`;
  }

  private listCacheKey(query: UserQueryDto): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(query))
      .digest('hex');
    return `${USER_CACHE_PREFIX}:list:${hash}`;
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.del(this.userCacheKey(userId));
    // Also invalidate list cache
    await this.cacheService.reset(); // For simplicity, reset all user-related cache or full
    this.logger.debug(`Cache invalidated for user: ${userId}`, 'UserService');
  }

  private toUserResponseDto(user: UserWithAclRelations): UserResponseDto {
    const mappedUser = this.mapUserAcl(user);
    const result = plainToInstance(UserResponseDto, mappedUser, {
      excludeExtraneousValues: true,
    });
    if (result.avatarUrl) {
      result.avatarUrl = this.storage.getUrl(result.avatarUrl);
    }
    return result;
  }

  private mapUserAcl(user: UserWithAclRelations): UserWithAcl {
    const roles = user.roles.map((ur) => ur.role.name);
    const rolePermissions = user.roles.flatMap(
      (ur) => ur.role.permissions?.map((rp) => rp.permission.name) || [],
    );
    const directPermissions =
      user.permissions?.map((up) => up.permission.name) || [];

    const permissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ];

    return {
      ...user,
      roles,
      permissions,
    };
  }

  async findAll(query: UserQueryDto): Promise<UserListResponseDto> {
    const cacheKey = this.listCacheKey(query);
    const cached = await this.cacheService.get<UserListResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for user list`, 'UserService');
      return cached;
    }

    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = (await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.user.count({ where }),
    ])) as [UserWithAclRelations[], number];

    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    const result: UserListResponseDto = {
      data: users.map((u) => this.toUserResponseDto(u)),
      meta,
    };

    await this.cacheService.set(cacheKey, result);
    return result;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const cacheKey = this.userCacheKey(id);
    const cached = await this.cacheService.get<UserResponseDto>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for user: ${id}`, 'UserService');
      return cached;
    }

    const user = (await this.prisma.user.findUnique({
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
    })) as UserWithAclRelations | null;

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const result = this.toUserResponseDto(user);
    await this.cacheService.set(cacheKey, result);
    return result;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const { roles, ...userData } = dto;

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = (await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: roles?.length
          ? {
              create: roles.map((roleName) => ({
                role: {
                  connect: { name: roleName },
                },
              })),
            }
          : {
              create: {
                role: {
                  connect: { name: 'USER' },
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
    })) as UserWithAclRelations;

    this.logger.log(`User created: ${user.id}`, 'UserService');
    await this.cacheService.reset();
    return this.toUserResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const { roles, ...updateData } = dto;

    const password = updateData.password
      ? await bcrypt.hash(updateData.password, 10)
      : undefined;

    const updated = (await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateData as any),
        ...(password && { password }),
        ...(roles && {
          roles: {
            deleteMany: {},
            create: roles.map((roleName) => ({
              role: {
                connect: { name: roleName },
              },
            })),
          },
        }),
      } as Prisma.UserUpdateInput,
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
    })) as UserWithAclRelations;

    this.logger.log(`User updated: ${id}`, 'UserService');
    await this.invalidateUserCache(id);
    return this.toUserResponseDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.prisma.user.delete({ where: { id } });

    if (existing.avatarUrl) {
      await this.storage.delete(existing.avatarUrl);
    }

    this.logger.log(`User deleted: ${id}`, 'UserService');
    await this.invalidateUserCache(id);
    return { message: `User "${id}" successfully deleted` };
  }

  async uploadAvatar(
    id: string,
    file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (user.avatarUrl) {
      await this.storage.delete(user.avatarUrl);
    }

    const avatarUrl = await this.storage.upload(file);

    const updated = (await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
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
    })) as UserWithAclRelations;

    this.logger.log(`Avatar uploaded for user: ${id}`, 'UserService');
    await this.invalidateUserCache(id);
    return this.toUserResponseDto(updated);
  }
}
