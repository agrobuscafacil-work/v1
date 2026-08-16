import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private cookieOptions(maxAgeSeconds: number, httpOnly: boolean) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge: maxAgeSeconds * 1000,
    };
  }

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    res.cookie(ACCESS_COOKIE, accessToken, this.cookieOptions(15 * 60, true));
    res.cookie(REFRESH_COOKIE, refreshToken, this.cookieOptions(7 * 24 * 3600, true));
  }

  private clearAuthCookies(res: any) {
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or document already registered' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(req.res, result.accessToken, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha incorretos. Verifique os dados informados e tente novamente.' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(req.res, result.accessToken, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const refreshToken = dto.refreshToken || (req.cookies as any)?.[REFRESH_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    const result = await this.authService.refreshToken(refreshToken);
    this.setAuthCookies(req.res, result.accessToken, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: any, @Req() req: Request) {
    const refreshToken = (req.cookies as any)?.[REFRESH_COOKIE];
    this.clearAuthCookies(req.res);
    if (user?.id) {
      return this.authService.logout(user.id, refreshToken);
    }
    if (refreshToken) {
      return this.authService.logoutByToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }
}