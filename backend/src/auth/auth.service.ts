import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
    if (!user || user.status !== 'ACTIVE' || (user.lockedUntil && user.lockedUntil > new Date()) || !(await argon2.verify(user.passwordHash, password))) {
      if (user) await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: { increment: 1 }, lockedUntil: user.failedLoginCount >= 4 ? new Date(Date.now() + 15 * 60_000) : undefined } }),
        this.prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN_FAILED', entityType: 'AUTH', ipAddress, userAgent } }),
      ]);
      throw new UnauthorizedException('Invalid credentials or unavailable account');
    }
    const permissions = [...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code)))];
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, permissions }, { secret: process.env.JWT_SECRET, expiresIn: (process.env.ACCESS_TOKEN_TTL ?? '15m') as never });
    const refreshToken = randomBytes(48).toString('base64url');
    const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } }),
      this.prisma.refreshSession.create({ data: { userId: user.id, tokenHash: hashToken(refreshToken), ipAddress, userAgent, expiresAt: new Date(Date.now() + days * 86_400_000) } }),
      this.prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN', entityType: 'AUTH', ipAddress, userAgent } }),
    ]);
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, displayName: user.displayName, permissions } };
  }

  async refresh(token: string, ipAddress?: string, userAgent?: string) {
    const session = await this.prisma.refreshSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } } });
    if (!session || session.revokedAt || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') throw new UnauthorizedException('Refresh session is invalid');
    const permissions = [...new Set(session.user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code)))];
    const accessToken = await this.jwt.signAsync({ sub: session.user.id, email: session.user.email, permissions }, { secret: process.env.JWT_SECRET, expiresIn: (process.env.ACCESS_TOKEN_TTL ?? '15m') as never });
    const refreshToken = randomBytes(48).toString('base64url');
    const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);
    await this.prisma.$transaction([
      this.prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } }),
      this.prisma.refreshSession.create({ data: { userId: session.user.id, tokenHash: hashToken(refreshToken), ipAddress, userAgent, expiresAt: new Date(Date.now() + days * 86_400_000) } }),
      this.prisma.auditLog.create({ data: { userId: session.user.id, action: 'SESSION_REFRESH', entityType: 'AUTH', ipAddress, userAgent } }),
    ]);
    return { accessToken, refreshToken };
  }

  async logout(token?: string, userId?: string, ipAddress?: string, userAgent?: string) {
    await this.prisma.$transaction([
      ...(token ? [this.prisma.refreshSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } })] : []),
      this.prisma.auditLog.create({ data: { userId, action: 'LOGOUT', entityType: 'AUTH', ipAddress, userAgent } }),
    ]);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user?.status === 'ACTIVE') {
      const token = randomBytes(32).toString('base64url');
      await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60_000) } });
      if (process.env.NODE_ENV !== 'production') return { accepted: true, developmentResetToken: token };
    }
    return { accepted: true };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) throw new BadRequestException('Reset token is invalid or expired');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await argon2.hash(password), failedLoginCount: 0, lockedUntil: null } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.prisma.auditLog.create({ data: { userId: record.userId, action: 'PASSWORD_RESET', entityType: 'AUTH' } }),
    ]);
  }

  async changePassword(userId: string, current: string, next: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await argon2.verify(user.passwordHash, current))) throw new UnauthorizedException('Current password is incorrect');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await argon2.hash(next) } }),
      this.prisma.refreshSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.prisma.auditLog.create({ data: { userId, action: 'PASSWORD_CHANGE', entityType: 'AUTH' } }),
    ]);
  }
}
