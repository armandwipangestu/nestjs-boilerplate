import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import ms from 'ms';
import { AppConfigService } from '../config/app-config.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type {
  JwtPayload,
  RequestWithCookies,
} from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto, AuthUserResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private appConfig: AppConfigService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'User already exists' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthUserResponseDto> {
    const user = await this.authService.register(registerDto);
    return plainToInstance(AuthUserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Login and receive tokens' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const result = await this.authService.login(user);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.appConfig.env.cookieSecure,
      sameSite: 'strict',
      maxAge: ms(this.appConfig.jwt.refreshExpiration),
    });

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      { excludeExtraneousValues: true },
    );
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiCookieAuth('refreshToken')
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.authService.refreshAccessToken(refreshToken);
  }

  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@CurrentUser() user: JwtPayload) {
    await this.authService.logout(user.sub, user.email);
    return {
      message: 'Logged out successfully',
    };
  }
}
