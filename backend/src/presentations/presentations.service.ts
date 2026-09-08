import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import PptxGenJS from 'pptxgenjs';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PresentationDto } from './presentations.dto';

@Injectable()
export class PresentationsService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly audit: AuditService) {}
  list() { return this.prisma.presentation.findMany({ include: { template: true, createdBy: { select: { displayName: true } }, _count: { select: { slides: true } } }, orderBy: { updatedAt: 'desc' } }); }
  find(id: string) { return this.prisma.presentation.findUniqueOrThrow({ where: { id }, include: { template: true, slides: { orderBy: { position: 'asc' }, include: { photos: { orderBy: { position: 'asc' }, include: { photo: true } } } } } }); }
  create(dto: PresentationDto, userId: string) { return this.prisma.presentation.create({ data: { title: dto.title, subtitle: dto.subtitle, templateId: dto.templateId, createdById: userId, slides: { create: dto.slides.map((slide) => ({ position: slide.position, title: slide.title, caption: slide.caption, photos: { create: slide.photoIds.map((photoId, position) => ({ photoId, position })) } })) } }, include: { slides: true } }); }
  async update(id: string, dto: PresentationDto) { return this.prisma.$transaction(async (tx) => { await tx.presentationSlide.deleteMany({ where: { presentationId: id } }); return tx.presentation.update({ where: { id }, data: { title: dto.title, subtitle: dto.subtitle, templateId: dto.templateId, slides: { create: dto.slides.map((slide) => ({ position: slide.position, title: slide.title, caption: slide.caption, photos: { create: slide.photoIds.map((photoId, position) => ({ photoId, position })) } })) } }, include: { slides: true } }); }); }
  remove(id: string) { return this.prisma.presentation.delete({ where: { id } }); }

  async generate(id: string, userId: string, archive = false) {
    const item = await this.find(id);
    if (!item.slides.length) throw new NotFoundException('Presentation has no slides');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'National Housing Authority, Bangladesh';
    pptx.subject = item.title;
    pptx.title = item.title;
    pptx.company = 'National Housing Authority';
    pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos' };
    const title = pptx.addSlide();
    title.background = { color: 'F4F7F5' };
    title.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.22, fill: { color: '0B6B45' }, line: { color: '0B6B45' } });
    title.addText('NATIONAL HOUSING AUTHORITY', { x: 0.8, y: 0.75, w: 11.7, h: 0.35, fontSize: 14, bold: true, color: '0B6B45', charSpacing: 1.4 });
    title.addText(item.title, { x: 0.8, y: 2.1, w: 11.7, h: 1, fontSize: 32, bold: true, color: '17352A', margin: 0 });
    if (item.subtitle) title.addText(item.subtitle, { x: 0.8, y: 3.25, w: 11.7, h: 0.6, fontSize: 18, color: '52655D', margin: 0 });
    title.addText(new Date().toLocaleDateString('en-GB'), { x: 0.8, y: 6.5, w: 3, h: 0.3, fontSize: 11, color: '52655D' });
    for (const [slideIndex, slideData] of item.slides.entries()) {
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText(slideData.title || item.title, { x: 0.55, y: 0.3, w: 11.8, h: 0.45, fontSize: 22, bold: true, color: '17352A', margin: 0 });
      const photos = slideData.photos.slice(0, 4);
      for (const [index, relation] of photos.entries()) {
        const columns = photos.length === 1 ? 1 : 2;
        const rows = Math.ceil(photos.length / columns);
        const w = columns === 1 ? 11.6 : 5.65;
        const h = rows === 1 ? 5.55 : 2.65;
        const x = 0.65 + (index % columns) * 5.95;
        const y = 0.95 + Math.floor(index / columns) * 2.9;
        slide.addImage({ path: this.storage.fullPath(relation.photo.storageKey), x, y, w, h, sizing: 'contain' } as never);
      }
      if (slideData.caption) slide.addText(slideData.caption, { x: 0.65, y: 6.65, w: 11.6, h: 0.3, fontSize: 11, color: '52655D', align: 'center', margin: 0 });
      slide.addText(`${slideIndex + 1}`, { x: 12.25, y: 7.08, w: 0.4, h: 0.2, fontSize: 9, color: '6B7B74', align: 'right', margin: 0 });
    }
    const key = `${archive ? 'presentations/archive' : 'temp/presentations'}/${id}-${randomUUID()}.pptx`;
    const path = this.storage.fullPath(key);
    await mkdir(dirname(path), { recursive: true });
    await pptx.writeFile({ fileName: path });
    await this.prisma.presentation.update({ where: { id }, data: { status: archive ? 'ARCHIVED' : 'GENERATED', archiveKey: archive ? key : undefined } });
    await this.audit.record(userId, 'PRESENTATION_GENERATION', 'PRESENTATION', id, { archived: archive });
    return { path, filename: `${item.title.replace(/[^a-z0-9-]+/gi, '-')}.pptx` };
  }
}
