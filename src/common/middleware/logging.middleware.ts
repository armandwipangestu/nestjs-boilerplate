import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../logger/logger.service';
import { randomUUID } from 'crypto';

/** Fields that must never appear in logged request bodies. */
const SENSITIVE_FIELDS = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'creditCard',
  'cvv',
  'ssn',
]);

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    body as Record<string, unknown>,
  )) {
    sanitized[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : value;
  }
  return sanitized;
}

/** Methods that typically carry a request body worth logging. */
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

const CONTEXT = 'HTTP';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // ── Request ID ──────────────────────────────────────────────────────────
    // Honour an incoming X-Request-Id (e.g. from a gateway) or generate one.
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);

    // ── High-resolution timer ────────────────────────────────────────────────
    const startAt = process.hrtime.bigint();

    const { method, originalUrl: url, ip } = req;
    const userAgent = req.get('user-agent') ?? '-';

    // ── Incoming request (debug – low noise in production) ───────────────────
    this.logger.debug(
      `Request: ${method} ${url}`,
      CONTEXT,
      {
        requestId,
        ip,
        userAgent,
        ...(BODY_METHODS.has(method) && Object.keys(req.body ?? {}).length > 0
          ? { body: sanitizeBody(req.body) }
          : {}),
      }
    );

    // ── Outgoing response ────────────────────────────────────────────────────
    res.on('finish', () => {
      const durationMs =
        Number(process.hrtime.bigint() - startAt) / 1_000_000;
      const { statusCode } = res;

      // Try to attach the authenticated user id if already resolved by Passport
      const userId = (
        req as Request & { user?: { sub?: string } }
      ).user?.sub;

      const meta = {
        requestId,
        method,
        url,
        statusCode,
        duration: `${durationMs.toFixed(2)}ms`,
        ip,
        userAgent,
        contentLength: res.get('content-length') ?? '-',
        ...(userId ? { userId } : {}),
      };

      const message = `Response: ${method} ${url} ${statusCode} ${durationMs.toFixed(2)}ms`;

      if (statusCode >= 500) {
        this.logger.error(message, undefined, CONTEXT, meta);
      } else if (statusCode >= 400) {
        this.logger.warn(message, CONTEXT, meta);
      } else {
        this.logger.log(message, CONTEXT, meta);
      }
    });

    next();
  }
}
