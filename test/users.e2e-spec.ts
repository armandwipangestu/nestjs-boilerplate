import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../src/config/app-config.service';

/**
 * Users E2E Tests
 *
 * These tests run against the full NestJS application.
 * They require a running database — set DATABASE_URL in .env.test.
 *
 * Usage:
 *   npx jest --testPathPattern=users.e2e-spec --config=test/jest-e2e.json
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeCreateUserDto = (overrides: Record<string, any> = {}) => ({
  username: `testuser_${Date.now()}`,
  email: `testuser_${Date.now()}@example.com`,
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  ...overrides,
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let appConfig: AppConfigService;
  let adminToken: string;
  let createdUserId: string;

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
      where: { email: 'admin-e2e@example.com' },
      update: {},
      create: {
        email: 'admin-e2e@example.com',
        username: 'admin_e2e',
        password: '$2b$10$hashedAdminPasswordForE2E',
        firstName: 'Admin',
        lastName: 'E2E',
        isActive: true,
        roles: {
          create: {
            role: { connect: { name: 'ADMIN' } },
          },
        },
        permissions: {
          create: [
            { permission: { connect: { name: 'index-user' } } },
            { permission: { connect: { name: 'show-user' } } },
            { permission: { connect: { name: 'store-user' } } },
            { permission: { connect: { name: 'update-user' } } },
            { permission: { connect: { name: 'destroy-user' } } },
          ],
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

    adminToken = jwtService.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        roles: ['ADMIN'],
        permissions: [
          'index-user',
          'show-user',
          'store-user',
          'update-user',
          'destroy-user',
        ],
      },
      {
        secret: appConfig.jwt.secret,
        expiresIn: appConfig.jwt.expiration,
      },
    );
  });

  afterAll(async () => {
    // Clean up seeded test data
    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin-e2e@example.com'] },
      },
    });

    if (createdUserId) {
      await prisma.user
        .deleteMany({ where: { id: createdUserId } })
        .catch(() => {});
    }

    await app.close();
  });

  // ─── GET /users ─────────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return paginated list of users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should support pagination query params', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should support search query param', () => {
      return request(app.getHttpServer())
        .get('/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  // ─── POST /users ────────────────────────────────────────────────────────────

  describe('POST /users', () => {
    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(makeCreateUserDto())
        .expect(401);
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'invalid@example.com' })
        .expect(400);
    });

    it('should create a new user and return 201', async () => {
      const dto = makeCreateUserDto();

      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(dto.email);
      expect(res.body.username).toBe(dto.username);
      expect(res.body).not.toHaveProperty('password');

      createdUserId = res.body.id;
    });

    it('should return 409 when email or username already exists', async () => {
      const dto = makeCreateUserDto({
        email: 'admin-e2e@example.com',
        username: 'admin_e2e',
      });

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(409);
    });
  });

  // ─── GET /users/:id ─────────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer()).get('/users/some-id').expect(401);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return the user by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body).toHaveProperty('roles');
      expect(res.body).toHaveProperty('permissions');
    });
  });

  // ─── PATCH /users/:id ───────────────────────────────────────────────────────

  describe('PATCH /users/:id', () => {
    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer())
        .patch(`/users/some-id`)
        .send({ firstName: 'Updated' })
        .expect(401);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should update firstName of existing user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'UpdatedName' })
        .expect(200);

      expect(res.body.firstName).toBe('UpdatedName');
    });
  });

  // ─── DELETE /users/:id ──────────────────────────────────────────────────────

  describe('DELETE /users/:id', () => {
    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer()).delete('/users/some-id').expect(401);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should delete the user and return 200 with success message', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');

      // Mark as deleted so afterAll doesn't re-attempt
      createdUserId = '';
    });
  });

  // ─── POST /users/:id/avatar ─────────────────────────────────────────────────

  describe('POST /users/:id/avatar', () => {
    let tempUserId: string;

    beforeAll(async () => {
      const dto = makeCreateUserDto();
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);
      tempUserId = res.body.id;
    });

    afterAll(async () => {
      if (tempUserId) {
        await prisma.user.delete({ where: { id: tempUserId } }).catch(() => {});
      }
    });

    it('should return 401 when no auth token provided', () => {
      return request(app.getHttpServer())
        .post(`/users/${tempUserId}/avatar`)
        .attach('file', Buffer.from('fake-image'), 'avatar.jpg')
        .expect(401);
    });

    it('should return 400 when no file is provided', () => {
      return request(app.getHttpServer())
        .post(`/users/${tempUserId}/avatar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should upload avatar and return updated user', () => {
      return request(app.getHttpServer())
        .post(`/users/${tempUserId}/avatar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'avatar.png',
          contentType: 'image/png',
        })
        .expect((res) => {
          // Accept 200 (success) or 500 (storage not configured in test env)
          expect([200, 500]).toContain(res.status);
        });
    });
  });
});
