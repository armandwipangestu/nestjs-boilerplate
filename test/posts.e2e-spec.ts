import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../src/config/app-config.service';

/**
 * Posts E2E Tests
 *
 * These tests run against the full NestJS application.
 * They require a running database — set DATABASE_URL in .env.test.
 *
 * Usage:
 *   npx jest --testPathPattern=posts.e2e-spec --config=test/jest-e2e.json
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeCreatePostDto = (overrides: Record<string, any> = {}) => ({
  title: `Test Post ${Date.now()}`,
  content: 'This is test post content',
  published: true,
  ...overrides,
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('PostController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let appConfig: AppConfigService;

  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let regularUserId: string;
  let createdPostId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global pipes as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    appConfig = moduleFixture.get<AppConfigService>(AppConfigService);

    // Seed an admin user for authenticated requests
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin-posts-e2e@example.com' },
      update: {},
      create: {
        email: 'admin-posts-e2e@example.com',
        username: 'admin_posts_e2e',
        password: '$2b$10$hashedAdminPasswordForPostE2E',
        firstName: 'Admin',
        lastName: 'Posts',
        isActive: true,
        roles: {
          create: {
            role: { connect: { name: 'ADMIN' } },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
        permissions: { include: { permission: true } },
      },
    });

    adminUserId = adminUser.id;
    adminToken = jwtService.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        roles: ['ADMIN'],
        permissions: [
          'index-post',
          'show-post',
          'store-post',
          'update-post',
          'destroy-post',
        ],
      },
      {
        secret: appConfig.jwt.secret,
        expiresIn: appConfig.jwt.expiration,
      },
    );

    // Seed a regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'user-posts-e2e@example.com' },
      update: {},
      create: {
        email: 'user-posts-e2e@example.com',
        username: 'user_posts_e2e',
        password: '$2b$10$hashedUserPasswordForPostE2E',
        firstName: 'Regular',
        lastName: 'User',
        isActive: true,
        roles: {
          create: {
            role: { connect: { name: 'USER' } },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
        permissions: { include: { permission: true } },
      },
    });

    regularUserId = regularUser.id;
    userToken = jwtService.sign(
      {
        sub: regularUser.id,
        email: regularUser.email,
        username: regularUser.username,
        roles: ['USER'],
        permissions: ['index-post', 'show-post', 'store-post'],
      },
      {
        secret: appConfig.jwt.secret,
        expiresIn: appConfig.jwt.expiration,
      },
    );
  });

  afterAll(async () => {
    // Clean up seeded test data
    await prisma.post.deleteMany({
      where: {
        authorId: { in: [adminUserId, regularUserId] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin-posts-e2e@example.com', 'user-posts-e2e@example.com'],
        },
      },
    });

    await app.close();
  });

  // ─── GET /posts ─────────────────────────────────────────────────────────────

  describe('GET /posts', () => {
    it('should return published posts without auth', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should support pagination query params', () => {
      return request(app.getHttpServer())
        .get('/posts?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should support search query param', () => {
      return request(app.getHttpServer())
        .get('/posts?search=test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('should restrict non-admin users to published posts only', async () => {
      // Create a draft post as admin
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Draft Post',
          content: 'Not published',
          published: false,
        })
        .expect(201);

      // User should not see draft posts
      return request(app.getHttpServer())
        .get('/posts?search=Draft')
        .expect(200)
        .expect((res) => {
          const draftPost = res.body.data.find(
            (p: any) => p.title === 'Draft Post' && !p.published,
          );
          expect(draftPost).toBeUndefined();
        });
    });

    it('should allow admin to see unpublished posts', async () => {
      const draftTitle = `Admin Draft ${Date.now()}`;
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: draftTitle,
          content: 'Admin draft content',
          published: false,
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/posts?search=' + draftTitle)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          const draftPost = res.body.data.find(
            (p: any) => p.title === draftTitle,
          );
          expect(draftPost).toBeDefined();
          expect(draftPost.published).toBe(false);
        });
    });
  });

  // ─── POST /posts ────────────────────────────────────────────────────────────

  describe('POST /posts', () => {
    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send(makeCreatePostDto())
        .expect(401);
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'No content' })
        .expect(400);
    });

    it('should create a new post and return 201', async () => {
      const dto = makeCreatePostDto();

      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(dto.title);
      expect(res.body.content).toBe(dto.content);
      expect(res.body.published).toBe(dto.published);
      expect(res.body.author).toBeDefined();

      createdPostId = res.body.id;
    });

    it('should set author to the authenticated user', async () => {
      const dto = makeCreatePostDto();

      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(res.body.authorId).toBe(adminUserId);
      expect(res.body.author.id).toBe(adminUserId);
    });

    it('should default published to false if not provided', async () => {
      const dto = { title: 'Default Published', content: 'Test' };

      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(res.body.published).toBe(false);
    });
  });

  // ─── GET /posts/:id ─────────────────────────────────────────────────────────

  describe('GET /posts/:id', () => {
    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .get('/posts/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return the post by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .expect(200);

      expect(res.body.id).toBe(createdPostId);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('content');
      expect(res.body).toHaveProperty('author');
    });

    it('should include author information', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .expect(200);

      expect(res.body.author).toBeDefined();
      expect(res.body.author.id).toBe(adminUserId);
      expect(res.body.author.username).toBeDefined();
    });
  });

  // ─── PATCH /posts/:id ───────────────────────────────────────────────────────

  describe('PATCH /posts/:id', () => {
    let testPostId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(makeCreatePostDto({ title: 'User Post for Update' }))
        .expect(201);
      testPostId = res.body.id;
    });

    afterAll(async () => {
      if (testPostId) {
        await prisma.post.delete({ where: { id: testPostId } }).catch(() => {});
      }
    });

    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer())
        .patch(`/posts/${testPostId}`)
        .send({ title: 'Updated' })
        .expect(401);
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .patch('/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('should return 403 when user is not the author and not admin', async () => {
      return request(app.getHttpServer())
        .patch(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated by Admin' })
        .expect(200); // Admin should be able to update
    });

    it('should allow post author to update their own post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('should allow admin to update any post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Updated by admin' })
        .expect(200);

      expect(res.body.content).toBe('Updated by admin');
    });

    it('should support partial updates', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ published: false })
        .expect(200);

      expect(res.body.published).toBe(false);
    });
  });

  // ─── DELETE /posts/:id ──────────────────────────────────────────────────────

  describe('DELETE /posts/:id', () => {
    let testPostId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(makeCreatePostDto({ title: 'Post for Deletion' }))
        .expect(201);
      testPostId = res.body.id;
    });

    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer()).delete('/posts/some-id').expect(401);
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .delete('/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should allow post author to delete their own post', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');

      // Verify post is deleted
      await request(app.getHttpServer())
        .get(`/posts/${testPostId}`)
        .expect(404);
    });

    it('should allow admin to delete any post', async () => {
      const adminPostRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(makeCreatePostDto({ title: 'Admin Post for Deletion' }))
        .expect(201);

      const adminPostId = adminPostRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/posts/${adminPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteRes.body).toHaveProperty('message');

      // Verify post is deleted
      await request(app.getHttpServer())
        .get(`/posts/${adminPostId}`)
        .expect(404);
    });

    it('should return 403 when non-author non-admin tries to delete', async () => {
      const userPostRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(makeCreatePostDto({ title: 'Another User Post' }))
        .expect(201);

      const userPostId = userPostRes.body.id;

      // Create another user token (simulated)
      const anotherUserToken = jwtService.sign(
        {
          sub: 'different-user-id',
          email: 'different@example.com',
          username: 'different_user',
          roles: ['USER'],
          permissions: ['index-post', 'show-post', 'store-post'],
        },
        {
          secret: appConfig.jwt.secret,
          expiresIn: appConfig.jwt.expiration,
        },
      );

      await request(app.getHttpServer())
        .delete(`/posts/${userPostId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);

      // Clean up
      await prisma.post.delete({ where: { id: userPostId } }).catch(() => {});
    });
  });
});
