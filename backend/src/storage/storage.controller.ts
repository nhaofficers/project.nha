import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../auth/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService, private readonly prisma: PrismaService) {}
  @Get('statistics') @RequirePermissions('SYSTEM_SETTINGS')
  async statistics() { const [bytes, photos] = await Promise.all([this.storage.size(), this.prisma.photo.count({ where: { deletedAt: null } })]); return { primaryBytes: bytes, photoCount: photos, backupStorageIncluded: false }; }
  @Get('health') @RequirePermissions('SYSTEM_SETTINGS')
  async health() { const used = await this.storage.size(); return { status: 'healthy', usedBytes: used, warningPercent: Number(process.env.STORAGE_WARNING_PERCENT ?? 70), criticalPercent: Number(process.env.STORAGE_CRITICAL_PERCENT ?? 90) }; }
}
