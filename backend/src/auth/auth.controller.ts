import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from './auth.decorators';
import type { AuthUser } from './auth.types';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, ResetPasswordDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  private cookie(response: Response, token: string) { response.cookie('nha_refresh', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/v1/auth', maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7) * 86_400_000 }); }

  @Public() @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password, req.ip, req.headers['user-agent']);
    this.cookie(res, result.refreshToken);
    const { refreshToken: _, ...safe } = result;
    return safe;
  }
  @Public() @Post('refresh') async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) { const result = await this.auth.refresh(req.cookies?.nha_refresh as string, req.ip, req.headers['user-agent']); this.cookie(res, result.refreshToken); return { accessToken: result.accessToken }; }
  @Public() @Post('forgot-password') async forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto.email); }
  @Public() @Post('reset-password') async reset(@Body() dto: ResetPasswordDto) { await this.auth.resetPassword(dto.token, dto.password); return { success: true }; }
  @Post('logout') async logout(@Req() req: Request & { user: AuthUser }, @Res({ passthrough: true }) res: Response) { await this.auth.logout(req.cookies?.nha_refresh as string | undefined, req.user.sub, req.ip, req.headers['user-agent']); res.clearCookie('nha_refresh', { path: '/api/v1/auth' }); return { success: true }; }
  @Post('change-password') async change(@Req() req: Request & { user: AuthUser }, @Body() dto: ChangePasswordDto) { await this.auth.changePassword(req.user.sub, dto.currentPassword, dto.newPassword); return { success: true }; }
}
