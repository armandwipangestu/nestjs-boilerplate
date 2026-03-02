import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';
import { AppConfigService } from './config/app-config.service';
import { CustomLoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

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
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
