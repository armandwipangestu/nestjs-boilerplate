import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import ms from 'ms';
import { AppConfigService } from '../config/app-config.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
    constructor(
        private authService: AuthService,
        private appConfig: AppConfigService,
    ) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
        const user = await this.authService.register(registerDto);
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }

    @Post('login')
    @HttpCode(200)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        const result = await this.authService.login(user);

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: this.appConfig.env.cookieSecure,
            sameSite: 'strict',
            maxAge: ms(this.appConfig.jwt.refreshExpiration)
        })

        return plainToInstance(AuthResponseDto, {
            accessToken: result.accessToken,
            user: result.user,
        }, { excludeExtraneousValues: true });
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
