import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logsDir = process.env.LOG_DIR || './logs';
    const appLogMaxSize = process.env.LOG_APP_MAX_SIZE || '20m';
    const appLogMaxFiles = process.env.LOG_APP_MAX_FILES || '14d';
    const errorLogMaxSize = process.env.LOG_ERROR_MAX_SIZE || '20m';
    const errorLogMaxFiles = process.env.LOG_ERROR_MAX_FILES || '30d';
    const isTest = process.env.LOG_TEST_MODE === 'true';

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
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

    const appTransport = new DailyRotateFile({
      dirname: logsDir,
      filename: 'application-%DATE%.log',
      datePattern: isTest ? 'YYYY-MM-DD-HH-mm' : 'YYYY-MM-DD',
      maxSize: isTest ? undefined : appLogMaxSize,
      maxFiles: isTest ? 3 : appLogMaxFiles,
      zippedArchive: true,
      format: winston.format.json(),
    });

    const errorTransport = new DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: errorLogMaxSize,
      maxFiles: errorLogMaxFiles,
      zippedArchive: true,
      level: 'error',
      format: winston.format.json(),
    });

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

        appTransport,
        errorTransport,
      ],
    });

    // Set log level from environment
    const logLevel = process.env.LOG_LEVEL || 'info';
    this.logger.level = logLevel;
  }

  log(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.info(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.debug(message, { context, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.warn(message, { context, ...meta });
  }

  error(
    message: string,
    stack?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ) {
    this.logger.error(message, { context, stack, ...meta });
  }

  fatal(
    message: string,
    stack?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ) {
    this.logger.log('fatal', message, { context, stack, ...meta });
  }

  trace(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.log('trace', message, { context, ...meta });
  }
}
