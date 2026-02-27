import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logsDir = process.env.LOG_DIR || './logs';

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Define log levels
    const levels = {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5,
    };

    // Define colors for console output
    const colors = {
      fatal: 'red',
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      trace: 'gray',
    };

    winston.addColors(colors);

    // Create logger instance
    this.logger = winston.createLogger({
      levels,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'nestjs-boilerplate' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info) => {
              const { level, message, timestamp, ...meta } = info;

              const safeLevel = String(level);
              const safeMessage = String(message);
              const safeTimestamp = String(timestamp);

              const metaStr =
                Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';

              return `${safeTimestamp} [${safeLevel}]: ${safeMessage} ${metaStr}`;
            }),
          ),
        }),

        // Daily rotate file for all logs
        new DailyRotateFile({
          filename: path.join(logsDir, 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
          format: winston.format.json(),
        }),

        new DailyRotateFile({
          filename: path.join(logsDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
          level: 'error',
          format: winston.format.json(),
        }),
      ],
    });

    // Set log level from environment
    const logLevel = process.env.LOG_LEVEL || 'info';
    this.logger.level = logLevel;
  }

  log(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.info(message, { trace, context, ...meta });
  }

  // NOTE: Only this must have trace
  error(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.warn(message, { trace, context, ...meta });
  }

  debug(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.debug(message, { trace, context, ...meta });
  }

  verbose(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.info(message, { trace, context, level: 'trace', ...meta });
  }

  fatal(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.log('fatal', message, { trace, context, ...meta });
  }

  trace(message: string, trace?: string, context?: string, meta?: Record<string, unknown>,) {
    this.logger.log('trace', message, { trace, context, ...meta });
  }
}
