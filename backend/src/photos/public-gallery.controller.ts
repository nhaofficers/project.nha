import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Public()
@Controller('public')
export class PublicGalleryController {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}

  @Get('projects')
  async projects() {
    const projects = await this.prisma.project.findMany({
      where: { deletedAt: null, photos: { some: { status: 'APPROVED', deletedAt: null } } },
      include: {
        projectType: true,
        projectStatus: true,
        photos: { where: { status: 'APPROVED', deletedAt: null }, select: { id: true }, orderBy: { captureDate: 'desc' }, take: 1 },
        _count: { select: { photos: { where: { status: 'APPROVED', deletedAt: null } } } },
      },
      orderBy: { projectName: 'asc' },
    });
    return projects.map(({ photos, ...project }) => ({ ...project, coverPhotoId: project.coverPhotoId ?? photos[0]?.id ?? null }));
  }

  @Get('projects/:id')
  async project(@Param('id', ParseUUIDPipe) id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null, photos: { some: { status: 'APPROVED', deletedAt: null } } },
      include: { projectType: true, projectStatus: true },
    });
    if (!project) throw new NotFoundException('প্রকল্পটি পাওয়া যায়নি');
    return project;
  }

  @Get('projects/:id/photos')
  async photos(@Param('id', ParseUUIDPipe) id: string) {
    return this.prisma.photo.findMany({
      where: { projectId: id, status: 'APPROVED', deletedAt: null },
      select: { id: true, title: true, description: true, captureDate: true, location: true, photographer: true, department: true },
      orderBy: [{ captureDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  @Get('photos/:id/thumbnail')
  thumbnail(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) { return this.media(id, true, res); }

  @Get('photos/:id/image')
  image(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) { return this.media(id, false, res); }

  private async media(id: string, thumbnail: boolean, res: Response) {
    const photo = await this.prisma.photo.findFirst({ where: { id, status: 'APPROVED', deletedAt: null } });
    if (!photo) throw new NotFoundException('অনুমোদিত ছবিটি পাওয়া যায়নি');
    const key = thumbnail ? photo.thumbnailKey : photo.storageKey;
    if (!(await this.storage.exists(key))) throw new NotFoundException('ছবির ফাইলটি পাওয়া যায়নি');
    res.type('image/webp');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    const stream = this.storage.stream(key);
    stream.on('error', (error) => res.destroy(error));
    stream.pipe(res);
  }
}
