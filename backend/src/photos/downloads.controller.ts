import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import archiver from 'archiver';
import type { Request, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ZipDownloadDto } from './photos.dto';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly audit: AuditService) {}
  @Post('zip') @RequirePermissions('PHOTO_DOWNLOAD')
  async zip(@Body() dto: ZipDownloadDto, @Req() req: Request & { user: AuthUser }, @Res() res: Response) {
    const unique = [...new Set(dto.photoIds)].slice(0, 250);
    const photos = await this.prisma.photo.findMany({ where: { id: { in: unique }, deletedAt: null, OR: [{ status: 'APPROVED' }, ...(req.user.permissions.includes('PHOTO_APPROVE') ? [{}] : [])] } });
    res.attachment(`nha-photos-${new Date().toISOString().slice(0, 10)}.zip`);
    res.type('application/zip');
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (error) => res.destroy(error));
    archive.pipe(res);
    photos.forEach((photo, index) => archive.append(this.storage.stream(photo.storageKey), { name: `${String(index + 1).padStart(3, '0')}-${photo.systemFileName}` }));
    await this.prisma.downloadLog.create({ data: { userId: req.user.sub, kind: 'ZIP', itemCount: photos.length } });
    await this.audit.record(req.user.sub, 'ZIP_GENERATION', 'DOWNLOAD', undefined, { itemCount: photos.length });
    await archive.finalize();
  }
}
