import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MetricsService } from '../observability/metrics.service';
import { CustomLoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly logger: CustomLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message };

    // Record Metrics
    const route = request.route?.path || request.url;
    // Normalize route to avoid cardinality explosion
    const normalizedRoute = this.normalizeRoute(route);

    this.metricsService.httpErrorsTotal.add(1, {
      method: request.method,
      route: normalizedRoute,
      status_code: status.toString(),
    });

    // Logging
    const context = 'ExceptionsHandler';
    const logMeta = {
      path: request.url,
      method: request.method,
      status,
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error(`Internal server error: ${logMeta.error}`, exception instanceof Error ? exception.stack : undefined, context, logMeta);
    } else {
      this.logger.warn(`HTTP exception: ${logMeta.error}`, context, logMeta);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    });
  }

  private normalizeRoute(route: string): string {
    // Basic normalization: remove query strings
    let normalized = route.split('?')[0];

    // In a more complex app, we might want to ensure we lead with NestJS normalized routes
    // But since this is a global filter, we get whatever is available.
    // request.route?.path is usually normalized like /users/:id

    return normalized || '/';
  }
}
