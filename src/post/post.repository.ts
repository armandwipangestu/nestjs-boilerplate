import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Post, Prisma } from '@prisma/client';

export type PostWithAuthor = Post & {
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
};

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly authorSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
  };

  async findMany(
    where: Prisma.PostWhereInput,
    skip: number,
    take: number,
  ): Promise<PostWithAuthor[]> {
    return (await this.prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: this.authorSelect } },
    })) as PostWithAuthor[];
  }

  async count(where: Prisma.PostWhereInput): Promise<number> {
    return this.prisma.post.count({ where });
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({ where: { id } });
  }

  async findByIdWithAuthor(id: string): Promise<PostWithAuthor | null> {
    return (await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: this.authorSelect } },
    })) as PostWithAuthor | null;
  }

  async createPost(data: {
    title: string;
    content: string;
    published: boolean;
    authorId: string;
  }): Promise<PostWithAuthor> {
    return (await this.prisma.post.create({
      data,
      include: { author: { select: this.authorSelect } },
    })) as PostWithAuthor;
  }

  async updatePost(
    id: string,
    data: Prisma.PostUpdateInput,
  ): Promise<PostWithAuthor> {
    return (await this.prisma.post.update({
      where: { id },
      data,
      include: { author: { select: this.authorSelect } },
    })) as PostWithAuthor;
  }

  async deletePost(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }
}
