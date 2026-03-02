import {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  UserPermission,
} from '@prisma/client';
import { Request } from 'express';

export type UserWithAclRelations = User & {
  roles: (UserRole & {
    role: Role & {
      permissions: (RolePermission & {
        permission: Permission;
      })[];
    };
  })[];
  permissions: (UserPermission & {
    permission: Permission;
  })[];
};

export type AuthUser = Pick<User, 'id' | 'email' | 'username'> & {
  roles: string[];
  permissions: string[];
};

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type UserWithAcl = User & {
  roles: string[];
  permissions: string[];
};

export interface UserListResponseDto {
  data: UserWithAcl[];
  meta: any;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
    [key: string]: string | undefined;
  };
}
