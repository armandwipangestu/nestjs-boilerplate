import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';
import * as pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { MetricsService } from '../common/observability/metrics.service';


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly extendedClient: any;

  constructor(
    private config: AppConfigService,
    private metricsService: MetricsService,
  ) {
    const pool = new pg.Pool({
      connectionString: config.databaseUrl,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const startTime = process.hrtime.bigint();
            const labels = { model: model || 'none', action: operation };

            // Increment total counter (all attempts)
            metricsService.dbQueryTotal.add(1, labels);

            try {
              const result = await query(args);
              const durationMs =
                Number(process.hrtime.bigint() - startTime) / 1_000_000;

              // Record duration
              metricsService.dbQueryDuration.record(durationMs, labels);

              // Check for slow queries
              if (durationMs > config.dbSlowQueryThreshold) {
                metricsService.dbSlowQueryTotal.add(1, labels);
              }

              return result;
            } catch (error) {
              // Increment error counter
              metricsService.dbQueryErrorsTotal.add(1, labels);
              throw error;
            }
          },
        },
      },
    });

    // Proxy this instance to the extended client to maintain the class structure
    // while providing the extended functionality.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target.extendedClient) {
          return Reflect.get(target.extendedClient, prop, receiver);
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
