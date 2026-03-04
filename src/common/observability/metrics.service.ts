import { Injectable, OnModuleInit } from '@nestjs/common';
import { metrics, Meter, Counter, Histogram, UpDownCounter } from '@opentelemetry/api';

@Injectable()
export class MetricsService implements OnModuleInit {
  private meter: Meter;

  // DB Metrics
  public dbQueryDuration: Histogram;
  public dbQueryTotal: Counter;
  public dbQueryErrorsTotal: Counter;
  public dbSlowQueryTotal: Counter;

  // Redis Metrics
  public redisCommandDuration: Histogram;
  public redisCommandTotal: Counter;
  public redisCommandErrorsTotal: Counter;

  // HTTP Metrics
  public httpErrorsTotal: Counter;
  public httpActiveRequests: UpDownCounter;

  onModuleInit() {
    this.meter = metrics.getMeter('nestjs-boilerplate');

    // Database Instruments
    this.dbQueryDuration = this.meter.createHistogram('db_query_duration_ms', {
      description: 'Duration of database queries in ms',
      unit: 'ms',
    });

    this.dbQueryTotal = this.meter.createCounter('db_query_total', {
      description: 'Total number of database queries',
    });

    this.dbQueryErrorsTotal = this.meter.createCounter('db_query_errors_total', {
      description: 'Total number of database query errors',
    });

    this.dbSlowQueryTotal = this.meter.createCounter('db_slow_query_total', {
      description: 'Total number of slow database queries',
    });

    // Redis Instruments
    this.redisCommandDuration = this.meter.createHistogram('redis_command_duration_ms', {
      description: 'Duration of redis commands in ms',
      unit: 'ms',
    });

    this.redisCommandTotal = this.meter.createCounter('redis_command_total', {
      description: 'Total number of redis commands',
    });

    this.redisCommandErrorsTotal = this.meter.createCounter('redis_command_errors_total', {
      description: 'Total number of redis command errors',
    });

    // HTTP Instruments
    this.httpErrorsTotal = this.meter.createCounter('http_errors_total', {
      description: 'Total number of HTTP errors',
    });

    this.httpActiveRequests = this.meter.createUpDownCounter('http_active_requests', {
      description: 'Number of active HTTP requests',
    });
  }
}
