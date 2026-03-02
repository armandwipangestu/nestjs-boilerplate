import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { PostListResponseDto, PostResponseDto } from './dto/post-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { AclGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/acl.constant';
import type { JwtPayload } from '../auth/interfaces/auth.interface';

@ApiTags('Posts')
@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ─── Public Endpoints ──────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'List posts',
    description:
      'Returns a paginated list of posts. Unauthenticated users see only published posts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of posts',
    type: PostListResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term matched against title and content',
  })
  @ApiQuery({
    name: 'published',
    required: false,
    type: Boolean,
    description: 'Filter by published status',
  })
  @Get()
  async findAll(
    @Query() query: PostQueryDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<PostListResponseDto> {
    const isAdmin = user?.roles?.includes('ADMIN') ?? false;
    return this.postService.findAll(query, isAdmin);
  }

  @ApiOperation({ summary: 'Get a single post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'clw1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Post found',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostResponseDto> {
    return this.postService.findOne(id);
  }

  // ─── Authenticated Endpoints ───────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized – JWT required' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AclGuard)
  @Permissions(PERMISSIONS.STORE_POST)
  @Post()
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PostResponseDto> {
    return this.postService.create(dto, user.sub);
  }

  @ApiOperation({ summary: 'Update post' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized – JWT required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – not the author or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AclGuard)
  @Permissions(PERMISSIONS.UPDATE_POST)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PostResponseDto> {
    return this.postService.update(id, dto, user.sub, user.roles);
  }

  @ApiOperation({ summary: 'Delete post' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Unauthorized – JWT required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – not the author or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AclGuard)
  @Permissions(PERMISSIONS.DESTROY_POST)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.postService.remove(id, user.sub, user.roles);
  }
}
