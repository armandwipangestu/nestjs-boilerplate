import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';
import * as pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { MetricsService } from '../common/observability/metrics.service';
import { CustomLoggerService } from '../common/logger/logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly extendedClient: ReturnType<PrismaClient['$extends']>;

  constructor(
    private readonly config: AppConfigService,
    private readonly metricsService: MetricsService,
    private readonly loggerService: CustomLoggerService,
  ) {
    const pool = new pg.Pool({
      connectionString: config.databaseUrl,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });

    const metrics = this.metricsService;
    const logger = this.loggerService;
    const configService = this.config;

    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const startTime = process.hrtime.bigint();
            const context = 'Prisma';

            const modelName = model || 'none';

            const labels = {
              model: modelName,
              action: operation,
            };

            // Count total DB queries
            metrics.dbQueryTotal.add(1, labels);

            try {
              const result = await query(args);

              const durationMs =
                Number(process.hrtime.bigint() - startTime) / 1_000_000;

              // Record query duration metric
              metrics.dbQueryDuration.record(durationMs, labels);

              // TRACE log for successful queries
              logger.trace('Database query executed', context, {
                model: modelName,
                operation,
                durationMs,
              });

              // Detect slow queries
              if (durationMs > configService.dbSlowQueryThreshold) {
                metrics.dbSlowQueryTotal.add(1, labels);

                logger.warn('Slow database query detected', context, {
                  model: modelName,
                  operation,
                  durationMs,
                });
              }

              return result;
            } catch (error) {
              metrics.dbQueryErrorsTotal.add(1, labels);

              logger.error(
                'Database query failed',
                error instanceof Error ? error.stack : undefined,
                context,
                {
                  model: modelName,
                  operation,
                },
              );

              throw error;
            }
          },
        },
      },
    });

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target.extendedClient) {
          return Reflect.get(target.extendedClient, prop, receiver);
        }

        return Reflect.get(target, prop, receiver);
      },
    }) as unknown as PrismaService;
  }

  async onModuleInit() {
    await this.$connect();

    this.loggerService.log('Prisma connected', 'Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();

    this.loggerService.log('Prisma disconnected', 'Prisma');
  }
}
