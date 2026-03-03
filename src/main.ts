import './otel';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';
import { AppConfigService } from './config/app-config.service';
import { CustomLoggerService } from './common/logger/logger.service';
import { otelSdk } from './otel';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();

  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  const configService = app.get(AppConfigService);

  logger.log('Application starting', 'Bootstrap', {
    nodeEnv: configService.env.nodeEnv,
  });

  if (configService.isCorsEnabled) {
    const cors = configService.corsConfig;

    app.enableCors(cors);

    logger.log('CORS enabled', 'Bootstrap', {
      origins: cors.origin,
      methods: cors.methods,
      credentials: cors.credentials,
    });
  }

  app.use(cookieParser());
  logger.debug('Cookie parser enabled', 'Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  logger.debug('Global ValidationPipe enabled', 'Bootstrap');

  if (configService.env.enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('NestJS Boilerplate API')
      .setDescription(packageJson.description)
      .setVersion(packageJson.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    logger.log('Swagger documentation enabled', 'Bootstrap', {
      path: '/docs',
    });
  }

  await app.listen(configService.env.port, configService.env.host);

  logger.log('Application started', 'Bootstrap', {
    host: configService.env.host,
    port: configService.env.port,
  });

  if (configService.logging.testMode) {
    logger.warn('LOG_TEST_MODE enabled: starting log spam...', 'Bootstrap');

    let counter = 0;

    setInterval(() => {
      for (let i = 0; i < 20; i++) {
        logger.log(`Rotation test log #${counter++}`, 'RotateTest');
      }
    }, 2000);
  }

  const gracefulShutdown = async (signal: string) => {
    logger.warn(`${signal} received. Starting graceful shutdown...`, 'Bootstrap');

    const shutdownTimeout = setTimeout(() => {
      logger.error('Force shutdown due to timeout', 'Bootstrap');
      process.exit(1);
    }, 5000);

    try {
      // Stop accepting new connections
      await app.close();
      logger.log('Nest application closed', 'Bootstrap');

      // Flush traces & stop metrics exporter
      if (otelSdk) {
        await otelSdk.shutdown();
        logger.log('OpenTelemetry SDK shut down', 'Bootstrap');
      }

      clearTimeout(shutdownTimeout);

      logger.log('Shutdown complete', 'Bootstrap');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error as any, 'Bootstrap');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
