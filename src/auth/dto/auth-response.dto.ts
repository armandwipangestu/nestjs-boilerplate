import { Expose, Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({
    example: 'clw1234567890',
    description: 'The unique identifier of the user',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'username123',
    description: 'The username of the user',
  })
  @Expose()
  username: string;

  @ApiProperty({ enum: Role, description: 'The role of the user' })
  @Expose()
  role: Role;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'The JWT access token' })
  @Expose()
  accessToken: string;

  @ApiProperty({ type: AuthUserResponseDto, description: 'The user information' })
  @Expose()
  @Type(() => AuthUserResponseDto)
  user: AuthUserResponseDto;
}
