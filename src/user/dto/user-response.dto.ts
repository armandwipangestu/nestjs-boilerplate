import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ required: false })
  @Expose()
  firstName: string | null;

  @ApiProperty({ required: false })
  @Expose()
  lastName: string | null;

  @ApiProperty({ type: [String], example: ['USER'] })
  @Expose()
  roles: string[];

  @ApiProperty({ type: [String], example: ['index-user'] })
  @Expose()
  permissions: string[];

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty({ required: false })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty()
  meta: any; // Using simplified meta for now or can reuse PaginationMetaDto if extracted
}
