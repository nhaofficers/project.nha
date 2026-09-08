import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Req } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() displayName!: string;
  @IsOptional() @IsString() department?: string;
  @IsString() @Length(12, 128) password!: string;
  @IsArray() @IsUUID(undefined, { each: true }) roleIds!: string[];
}
class UpdateUserDto { @IsEmail() email!: string; @IsString() displayName!: string; @IsOptional() @IsString() department?: string; @IsArray() @IsUUID(undefined, { each: true }) roleIds!: string[]; }
class StatusDto { @IsEnum(UserStatus) status!: UserStatus; }

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  @Get() @RequirePermissions('USER_VIEW') list() { return this.prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, email: true, displayName: true, department: true, status: true, lastLoginAt: true, createdAt: true, roles: { include: { role: true } } }, orderBy: { displayName: 'asc' } }); }
  @Get(':id') @RequirePermissions('USER_VIEW') find(@Param('id', ParseUUIDPipe) id: string) { return this.prisma.user.findUniqueOrThrow({ where: { id }, select: { id: true, email: true, displayName: true, department: true, status: true, roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } }); }
  @Post() @RequirePermissions('USER_CREATE') async create(@Body() dto: CreateUserDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.user.create({ data: { email: dto.email.toLowerCase(), displayName: dto.displayName, department: dto.department, passwordHash: await argon2.hash(dto.password), roles: { create: dto.roleIds.map((roleId) => ({ roleId })) } }, select: { id: true, email: true, displayName: true, status: true } }); await this.audit.record(req.user.sub, 'CREATE', 'USER', item.id); return item; }
  @Put(':id') @RequirePermissions('USER_EDIT') async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.$transaction(async (tx) => { await tx.userRole.deleteMany({ where: { userId: id } }); return tx.user.update({ where: { id }, data: { email: dto.email.toLowerCase(), displayName: dto.displayName, department: dto.department, roles: { create: dto.roleIds.map((roleId) => ({ roleId })) } }, select: { id: true, email: true, displayName: true, status: true } }); }); await this.audit.record(req.user.sub, 'EDIT', 'USER', id); return item; }
  @Patch(':id/status') @RequirePermissions('USER_EDIT') async status(@Param('id', ParseUUIDPipe) id: string, @Body() dto: StatusDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.user.update({ where: { id }, data: { status: dto.status } }); await this.audit.record(req.user.sub, 'STATUS_CHANGE', 'USER', id, { status: dto.status }); return item; }
  @Delete(':id') @RequirePermissions('USER_DELETE') async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }) { await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'DISABLED' } }); await this.audit.record(req.user.sub, 'DELETE', 'USER', id); return { success: true }; }
}
