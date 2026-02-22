import { User } from "@prisma/client";

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