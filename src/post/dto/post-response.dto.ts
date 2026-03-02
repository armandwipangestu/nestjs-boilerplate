import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

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

export class PostListResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  data: PostResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
