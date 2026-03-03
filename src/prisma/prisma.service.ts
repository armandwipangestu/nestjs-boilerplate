import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';
import * as pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(public config: AppConfigService) {
    const adapter = PrismaService.getAdapter(config);
    super({ adapter });
  }

  private static getAdapter(config: AppConfigService) {
    const url = config.databaseUrl;
    const provider = config.databaseProvider;

    switch (provider) {
      case 'postgresql': {
        const pool = new pg.Pool({ connectionString: url });
        return new PrismaPg(pool);
      }
      case 'mysql': {
        return new PrismaMariaDb(url);
      }
      case 'sqlite': {
        return new PrismaBetterSqlite3({ url });
      }
      default:
        throw new Error(`Unsupported database provider: ${provider}`);
    }
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
