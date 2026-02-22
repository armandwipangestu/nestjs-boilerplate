import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from 'src/config/app-config.service';
import * as pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService 
    extends PrismaClient 
    implements OnModuleInit, OnModuleDestroy 
{
    constructor(private config: AppConfigService) {
        const pool = new pg.Pool({
            connectionString: config.databaseUrl,
        });

        const adapter = new PrismaPg(pool);

        super({ adapter });
    }
        
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
