import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AppConfigService } from 'src/config/app-config.service';
import { AppConfigModule } from 'src/config/app-config.module';

@Module({
    imports: [
        PrismaModule,
        LoggerModule,
        PassportModule,
        AppConfigModule,
        JwtModule.registerAsync({
            imports: [AppConfigModule],
            inject: [AppConfigService],
            useFactory: (appConfig: AppConfigService) => ({
                secret: appConfig.jwt.secret,
                signOptions: {
                    expiresIn: appConfig.jwt.expiration,
                }
            })
        }),
    ],
    providers: [
        AuthService,
        JwtStrategy,
    ],
    controllers: [
        AuthController,
    ],
    exports: [
        AuthService,
    ],
})
export class AuthModule {}
