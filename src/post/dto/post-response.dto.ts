import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty({ example: 'clw1234567890' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'john_doe' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  firstName: string | null;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  lastName: string | null;
}

export class PostResponseDto {
  @ApiProperty({ example: 'clw1234567890', description: 'Unique post ID' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'My First Post' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'This is the full content of the post...' })
  @Expose()
  content: string;

  @ApiProperty({ example: false })
  @Expose()
  published: boolean;

  @ApiProperty({ example: 'clw0987654321', description: 'Author user ID' })
  @Expose()
  authorId: string;

  @ApiProperty({ type: PostAuthorDto })
  @Expose()
  @Type(() => PostAuthorDto)
  author: PostAuthorDto;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-16T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 42, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  hasPrevPage: boolean;
}

export class PostListResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  data: PostResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
