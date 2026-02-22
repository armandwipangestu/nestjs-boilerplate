import { User } from '@prisma/client';
import { Request } from 'express';

export type AuthUser = Pick<User, 'id' | 'email' | 'username' | 'role'>;

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
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
