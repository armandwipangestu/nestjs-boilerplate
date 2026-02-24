import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { SkipThrottle } from '@nestjs/throttler';
import { CustomLoggerService } from '../logger/logger.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private redisHealth: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private logger: CustomLoggerService,
  ) {}

  @Get()
  @SkipThrottle()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    this.logger.debug('Health check requested', 'HealthController');

    const result = await this.health.check([
      () => this.redisHealth.isHealthy('redis'),
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }), // 90%
    ]);

    // Log a warning only when the overall status is degraded or down
    if (result.status !== 'ok') {
      this.logger.warn(
        `Health check status: ${result.status}. Details: ${JSON.stringify(result.error)}`,
        'HealthController',
      );
    }

    return result;
  }
}
