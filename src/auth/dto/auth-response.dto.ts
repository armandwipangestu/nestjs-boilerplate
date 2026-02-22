import { Expose, Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: Role;
}

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
