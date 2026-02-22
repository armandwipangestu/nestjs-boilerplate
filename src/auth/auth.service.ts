import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from "../prisma/prisma.service"
import * as bcrypt from "bcryptjs"
import { CustomLoggerService } from '../common/logger/logger.service';
import { RefreshToken, User } from '@prisma/client';
import ms from 'ms';
import { AppConfigService } from 'src/config/app-config.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

type AuthUser = Pick<User, 'id' | 'email' | 'username' | 'role'>;

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private logger: CustomLoggerService,
        private appConfig: AppConfigService,
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            this.logger.warn(`Login attempt with non-existent email: ${email}`, 'Auth')
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            this.logger.warn(`Login attempt with inactive user: ${email}`, 'Auth')
            throw new UnauthorizedException('User account is inactive');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Failed to login attempt for user: ${email}`, 'Auth')
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User logged in: ${email}`, 'Auth');
        return user;
    }

    async login(user: AuthUser) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.appConfig.jwt.secret,
            expiresIn: this.appConfig.jwt.expiration,
        })

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.appConfig.jwt.refreshSecret,
            expiresIn: this.appConfig.jwt.refreshExpiration,
        })

        // Store refresh token in database
        const expiresAt = new Date(
            Date.now() + ms(this.appConfig.jwt.refreshExpiration)
        );

        const hashedToken = await bcrypt.hash(refreshToken, 10);

        await this.prisma.refreshToken.create({
            data: {
                token: hashedToken,
                userId: user.id,
                expiresAt,
            }
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.appConfig.jwt.refreshSecret,
            });

            // Verify token exists in database
            const storedTokens = await this.prisma.refreshToken.findMany({
               where: {
                userId: payload.sub,
                expiresAt: { gt: new Date() },
               }
            });

            let matchedToken: RefreshToken | null = null;

            for (const tokenRecord of storedTokens) {
                const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token);
                if (isMatch) {
                    matchedToken = tokenRecord;
                    break;
                }
            }

            if (!matchedToken || matchedToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Refresh token expired or invalid');
            }

            const user = await this.prisma.user.findUnique({
                where: {
                    id: payload.sub,
                }
            })

            if (!user || !user.isActive) {
                throw new UnauthorizedException('User not found or inactive');
            }

            const newPayload = {
                sub: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            };

            const newAccessToken = this.jwtService.sign(newPayload, {
                secret: this.appConfig.jwt.secret,
                expiresIn: this.appConfig.jwt.expiration,
            })

            this.logger.debug(`Token refreshed successfully for: ${user.email}`, 'Auth');

            return {
                accessToken: newAccessToken,
            }
        } catch (error) {
            this.logger.error(`Invalid refresh token`, error.message, 'Auth')
            throw new UnauthorizedException('Invalid refresh token')
        }
    }

    async logout(userId: string, email: string) { 
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
            },
        });

        this.logger.log(`User logged out: ${email}`, 'Auth')
    }
}
