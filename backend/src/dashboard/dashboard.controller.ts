import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { IsArray, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

class SettingDto { @IsString() @MaxLength(100) key!: string; @IsString() @MaxLength(1000) value!: string; }
class SettingsDto { @IsArray() @ValidateNested({ each: true }) @Type(() => SettingDto) settings!: SettingDto[]; }

@Controller()
export class DashboardController {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly audit: AuditService) {}
  @Get('dashboard') @RequirePermissions('PHOTO_VIEW')
  async dashboard() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalPhotos, projects, events, pendingReviews, todayUploads, monthUploads, recentUploads, storageUsed, growth] = await Promise.all([
      this.prisma.photo.count({ where: { deletedAt: null } }), this.prisma.project.count({ where: { deletedAt: null } }), this.prisma.event.count({ where: { deletedAt: null } }),
      this.prisma.photo.count({ where: { deletedAt: null, status: 'PENDING_REVIEW' } }), this.prisma.photo.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
      this.prisma.photo.count({ where: { createdAt: { gte: month }, deletedAt: null } }), this.prisma.photo.findMany({ where: { deletedAt: null }, take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, status: true, createdAt: true } }),
      this.storage.size(), this.prisma.storageLog.findMany({ take: 12, orderBy: { recordedAt: 'desc' } }),
    ]);
    return { totalPhotos, projects, events, pendingReviews, photosUploadedToday: todayUploads, photosUploadedThisMonth: monthUploads, recentUploads, storageUsedBytes: storageUsed, monthlyStorageGrowth: growth.map((x) => ({ ...x, id: x.id.toString(), primaryBytes: x.primaryBytes.toString(), availableBytes: x.availableBytes?.toString() })) };
  }
  @Get('settings') @RequirePermissions('SYSTEM_SETTINGS') settings() { return this.prisma.systemSetting.findMany({ where: { isSecret: false }, orderBy: { key: 'asc' } }); }
  @Put('settings') @RequirePermissions('SYSTEM_SETTINGS') async update(@Body() dto: SettingsDto, @Req() req: Request & { user: AuthUser }) { await this.prisma.$transaction(dto.settings.map((setting) => this.prisma.systemSetting.upsert({ where: { key: setting.key }, update: { value: setting.value }, create: setting }))); await this.audit.record(req.user.sub, 'SETTINGS_CHANGE', 'SYSTEM', undefined, { keys: dto.settings.map((x) => x.key) }); return { success: true }; }
}
