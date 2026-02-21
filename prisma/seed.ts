import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';

const { Pool } = pg;

/**
 * Prisma v7 Database Seeder
 * Uses the PostgreSQL adapter for optimized connection handling
 * Generates realistic data using Faker
 */

async function main() {
  // Initialize PostgreSQL connection pool
  const pool = new Pool({
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

    // Seed Users
    console.log('👥 Seeding users...');
    const users = [];

    // Create 5 realistic users
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          username: faker.internet.username().toLowerCase(),
          password: faker.internet.password({
            length: 12,
            memorable: false,
            pattern: /[A-Za-z0-9!@#$%]/,
          }),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role:
            i === 0
              ? 'ADMIN'
              : faker.helpers.arrayElement([
                  'USER',
                  'MODERATOR',
                  'USER',
                  'USER',
                ]),
          isActive: faker.datatype.boolean({ probability: 0.9 }),
        },
      });
      users.push(user);
      console.log(`  ✓ Created user: ${user.email} (${user.role})`);
    }
    console.log();

    // Seed Posts
    console.log('📝 Seeding posts...');
    const posts = [];

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
    const refreshTokens = [];

    for (const user of users) {
      // Each user gets 1-3 refresh tokens
      const tokenCount = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < tokenCount; i++) {
        const refreshToken = await prisma.refreshToken.create({
          data: {
            token: faker.string.alphanumeric({
              length: { min: 32, max: 64 },
            }),
            userId: user.id,
            expiresAt: faker.date.future({
              years: 1,
            }),
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
