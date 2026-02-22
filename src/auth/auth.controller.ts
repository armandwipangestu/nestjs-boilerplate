import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import ms from 'ms';
import { AppConfigService } from 'src/config/app-config.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private appConfig: AppConfigService,
    ) {}

    @Post('login')
    @HttpCode(200)
    async login(
        @Body() body: { email: string, password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(body.email, body.password);
        const { accessToken, refreshToken, user: UserData } = await this.authService.login(user);

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.appConfig.env.cookieSecure,
            sameSite: 'strict',
            maxAge: ms(this.appConfig.jwt.refreshExpiration)
        })

        return {
            accessToken,
            user: UserData,
        }
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Req() req: Request) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found')
        }

        return this.authService.refreshAccessToken(refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async logout(@CurrentUser() user: JwtPayload) {
        await this.authService.logout(user.sub, user.email);
        return {
            message: 'Logged out successfully'
        };
    }
}
