import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env if it exists
if (existsSync('.env')) {
  dotenv.config();
}

const provider = process.env.DATABASE_PROVIDER || 'sqlite';
const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');

if (!existsSync(schemaPath)) {
  console.error(`Schema file not found at ${schemaPath}`);
  process.exit(1);
}

let schemaContent = readFileSync(schemaPath, 'utf-8');

// 1. Update datasource provider
const prismaProvider = provider === 'mariadb' ? 'mysql' : provider;
schemaContent = schemaContent.replace(
  /datasource db \{[\s\S]*?provider\s*=\s*".*?"/,
  `datasource db {\n  provider = "${prismaProvider}"`
);

// 2. Handle provider-specific attributes
if (provider === 'sqlite') {
  // SQLite doesn't support @db.Text
  console.log('Transforming schema for SQLite...');
  schemaContent = schemaContent.replace(/@db\.Text/g, '');
} else if (provider === 'postgresql' || provider === 'mysql' || provider === 'mariadb') {
  console.log(`Transforming schema for ${provider}...`);
  // Ensure @db.Text is present for long text fields if needed
  // For this boilerplate, only Post.content uses it.
  if (!schemaContent.includes('@db.Text')) {
     schemaContent = schemaContent.replace(
       /content\s+String(\s+)(?!@db\.Text)/,
       'content   String$1@db.Text'
     );
  }
}

writeFileSync(schemaPath, schemaContent);
console.log(`Successfully updated prisma/schema.prisma for provider: ${provider}`);
