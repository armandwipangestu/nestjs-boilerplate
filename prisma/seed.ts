import { PrismaClient, User, Post, RefreshToken, Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';

/**
 * Prisma v7 Database Seeder
 * Uses the PostgreSQL adapter for optimized connection handling
 * Generates realistic data using Faker
 */

const refreshExpiration: StringValue =
  (process.env.JWT_REFRESH_EXPIRATION as StringValue) ?? '7d';

const jwtRefreshService = new JwtService({
  secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_dev',
  signOptions: {
    expiresIn: refreshExpiration,
  },
});

async function main() {
  // Initialize PostgreSQL connection pool
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Initialize Prisma Client with PostgreSQL adapter (Prisma v7 pattern)
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data (in reverse dependency order)
    console.log('🗑️  Clearing existing data...');
    await prisma.refreshToken.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Data cleared\n');

    const users: User[] = [];
    const posts: Post[] = [];
    const refreshTokens: RefreshToken[] = [];

    // Seed Users
    console.log('👥 Seeding users...');

    // Create 1 fixed super admin
    console.log('👑 Creating fixed super admin...');

    const fixedAdminEmail = 'admin@example.com';
    const fixedAdminPasswordPlain = 'Admin123!';
    const fixedAdminPassword = await bcrypt.hash(fixedAdminPasswordPlain, 10);

    const fixedAdmin = await prisma.user.create({
      data: {
        email: fixedAdminEmail,
        username: 'superadmin',
        password: fixedAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: Role.ADMIN,
        isActive: true,
      },
    });

    users.push(fixedAdmin);

    console.log(`  ✓ Fixed admin created: ${fixedAdmin.email}`);
    console.log(`  🔐 Login with:`);
    console.log(`     Email:    ${fixedAdminEmail}`);
    console.log(`     Password: ${fixedAdminPasswordPlain}`);
    console.log();

    // Create 3 realistic users as admin
    console.log('👑 Creating admin users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    for (let i = 0; i < 3; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          username: faker.internet.username().toLowerCase(),
          password: adminPassword,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: Role.ADMIN,
          isActive: true,
        },
      });
      users.push(user);
      console.log(`  ✓ Created admin user: ${user.email} (${user.role})`);
    }
    console.log();

    // Create 5 realistic users as moderator
    console.log('🛡️  Creating moderator users...');
    const moderatorPassword = await bcrypt.hash('moderator123', 10);
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          username: faker.internet.username().toLowerCase(),
          password: moderatorPassword,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: Role.MODERATOR,
          isActive: true,
        },
      });
      users.push(user);
      console.log(`  ✓ Created moderator user: ${user.email} (${user.role})`);
    }
    console.log();

    // Create 10 realistic users as user
    console.log('👤 Creating normal users...');
    const userPassword = await bcrypt.hash('user123', 10);
    for (let i = 0; i < 10; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          username: faker.internet.username().toLowerCase(),
          password: userPassword,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: Role.USER,
          isActive: true,
        },
      });
      users.push(user);
      console.log(`  ✓ Created user: ${user.email} (${user.role})`);
    }
    console.log();

    // Seed Posts
    console.log('📝 Seeding posts...');

    for (const user of users) {
      // Each user gets 2-5 posts
      const postCount = faker.number.int({ min: 2, max: 5 });

      for (let i = 0; i < postCount; i++) {
        const post = await prisma.post.create({
          data: {
            title: faker.lorem.sentence({ min: 5, max: 10 }),
            content: faker.lorem.paragraphs({ min: 2, max: 5 }),
            published: faker.datatype.boolean({ probability: 0.7 }),
            authorId: user.id,
          },
        });
        posts.push(post);
      }

      console.log(`  ✓ Created ${postCount} posts for user: ${user.email}`);
    }
    console.log();

    // Seed Refresh Tokens
    console.log('🔑 Seeding refresh tokens...');

    for (const user of users) {
      // Each user gets 1-3 refresh tokens
      const tokenCount = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < tokenCount; i++) {
        const refreshTokenValue = await jwtRefreshService.signAsync({
          sub: user.id,
          email: user.email,
          role: user.role,
          type: 'refresh',
        })

        const decoded = jwtRefreshService.decode(refreshTokenValue) as { exp: number };

        const hashedToken = await bcrypt.hash(refreshTokenValue, 10);

        const refreshToken = await prisma.refreshToken.create({
          data: {
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(decoded.exp * 1000),
          },
        });

        refreshTokens.push(refreshToken);
      }

      console.log(
        `  ✓ Created ${tokenCount} refresh tokens for user: ${user.email}`,
      );
    }
    console.log();

    // Print summary
    console.log('═══════════════════════════════════════');
    console.log('✨ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`\n📊 Seeded Data Summary:`);
    console.log(`  • Users:          ${users.length}`);
    console.log(`  • Posts:          ${posts.length}`);
    console.log(`  • Refresh Tokens: ${refreshTokens.length}`);
    console.log();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Disconnect Prisma Client and close the database connection pool
    await prisma.$disconnect();
    await pool.end();
  }
}

// Execute main function with proper error handling
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
