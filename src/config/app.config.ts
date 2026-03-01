import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export interface AppConfig {
  databaseUrl: string;

  jwt: {
    secret: string;
    expiration: StringValue;
    refreshSecret: string;
    refreshExpiration: StringValue;
  };

  redis: {
    host: string;
    port: number;
    password: string;
  };

  logging: {
    level: string;
    dir: string;
  };

  env: {
    nodeEnv: string;
    host: string;
    port: number;
    cookieSecure: boolean;
    corsAllowedOrigins: string;
    enableSwagger: boolean;
  };

  throttler: {
    ttl: number;
    limit: number;
  };

  cache: {
    ttl: number;
  };

  s3: {
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
    bucket?: string;
    region?: string;
    forcePathStyle?: boolean;
  };
}

export default registerAs('app', () => ({
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: (process.env.JWT_EXPIRATION ?? '15m') as StringValue,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiration: (process.env.JWT_REFRESH_EXPIRATION ??
      '7d') as StringValue,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    dir: process.env.LOG_DIR ?? './logs',
  },
  env: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    host: process.env.HOST ?? '127.0.0.1',
    port: parseInt(process.env.PORT ?? '3000', 10),
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS ?? '*',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLER_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLER_LIMIT ?? '10', 10),
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL ?? '60', 10),
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },
}));
