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
    port: number;
    cookieSecure: boolean;
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
    port: parseInt(process.env.PORT ?? '3000', 10),
    cookieSecure: process.env.COOKIE_SECURE === 'true',
  },
}));
