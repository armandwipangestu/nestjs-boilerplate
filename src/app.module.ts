import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/app-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
