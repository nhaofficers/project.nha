import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PhotoStatus, Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import sharp from 'sharp';
import { AuditService } from '../audit/audit.service';
import { pageResult } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PhotoMetadataDto, PhotoSearchDto, UpdatePhotoDto } from './photos.dto';

type UploadFile = Express.Multer.File;
const allowed = new Map([['ffd8ff', 'image/jpeg'], ['89504e470d0a1a0a', 'image/png'], ['52494646', 'image/webp']]);

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly audit: AuditService) {}

  private detectedMime(buffer: Buffer) {
    const hex = buffer.subarray(0, 12).toString('hex');
    if (hex.startsWith('ffd8ff')) return 'image/jpeg';
    if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
    if (hex.startsWith('52494646') && buffer.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
    return undefined;
  }

  async upload(file: UploadFile, metadata: PhotoMetadataDto, userId: string) {
    const mime = this.detectedMime(file.buffer);
    if (!mime || !allowed.has(file.buffer.subarray(0, mime === 'image/png' ? 8 : mime === 'image/jpeg' ? 3 : 4).toString('hex'))) throw new BadRequestException('Unsupported or invalid image signature');
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extname(file.originalname).toLowerCase())) throw new BadRequestException('File extension does not match an allowed image type');
    if (file.size > Number(process.env.MAX_UPLOAD_SIZE ?? 15_728_640)) throw new BadRequestException('Image exceeds configured upload limit');
    const sha256Hash = createHash('sha256').update(file.buffer).digest('hex');
    const duplicate = await this.prisma.photo.findUnique({ where: { sha256Hash }, select: { id: true, originalFileName: true } });
    if (duplicate) throw new ConflictException({ message: 'Duplicate photograph detected', code: 'DUPLICATE_PHOTO', duplicate });
    let image = sharp(file.buffer, { failOn: 'error', limitInputPixels: 80_000_000 }).rotate();
    const source = await image.metadata();
    if (!source.width || !source.height) throw new BadRequestException('Image dimensions could not be read');
    const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? 1920);
    const maxHeight = Number(process.env.IMAGE_MAX_HEIGHT ?? 1920);
    const optimized = await image.clone().resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true }).webp({ quality: Number(process.env.WEBP_QUALITY ?? 80) }).toBuffer({ resolveWithObject: true });
    const thumbnail = await image.clone().resize({ width: Number(process.env.THUMBNAIL_SIZE ?? 480), height: Number(process.env.THUMBNAIL_SIZE ?? 480), fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toBuffer({ resolveWithObject: true });
    const date = new Date(metadata.captureDate);
    const stem = `NHA-${randomUUID()}`;
    const base = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${metadata.projectId ?? 'general'}/${metadata.eventId ?? 'general'}`;
    const storageKey = `photos/${base}/${stem}.webp`;
    const thumbnailKey = `thumbnails/${base}/${stem}.webp`;
    const retainOriginal = Boolean(metadata.retainOriginal);
    const originalStorageKey = retainOriginal ? `originals/${base}/${stem}${extname(file.originalname).toLowerCase()}` : null;
    const written = [storageKey, thumbnailKey];
    try {
      await this.storage.put(storageKey, optimized.data);
      await this.storage.put(thumbnailKey, thumbnail.data);
      if (originalStorageKey) { await this.storage.put(originalStorageKey, file.buffer); written.push(originalStorageKey); }
      const photo = await this.prisma.photo.create({ data: {
        systemFileName: `${stem}.webp`, originalFileName: file.originalname, storageKey, thumbnailKey, originalStorageKey, retainOriginal,
        mimeType: 'image/webp', fileSize: optimized.data.length, width: optimized.info.width, height: optimized.info.height, sha256Hash,
        title: metadata.title, description: metadata.description, captureDate: date, location: metadata.location, photographer: metadata.photographer,
        department: metadata.department, remarks: metadata.remarks, projectId: metadata.projectId, eventId: metadata.eventId, uploadedById: userId,
        versions: { create: [
          { kind: 'OPTIMIZED', storageKey, mimeType: 'image/webp', fileSize: optimized.data.length, width: optimized.info.width, height: optimized.info.height },
          { kind: 'THUMBNAIL', storageKey: thumbnailKey, mimeType: 'image/webp', fileSize: thumbnail.data.length, width: thumbnail.info.width, height: thumbnail.info.height },
          ...(originalStorageKey ? [{ kind: 'ORIGINAL' as const, storageKey: originalStorageKey, mimeType: mime, fileSize: file.size, width: source.width, height: source.height }] : []),
        ] },
        tags: metadata.tags?.length ? { create: [...new Set(metadata.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].map((name) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) } : undefined,
      }, include: { tags: { include: { tag: true } } } });
      await this.audit.record(userId, 'UPLOAD', 'PHOTO', photo.id, { originalFileName: file.originalname, optimizedBytes: optimized.data.length });
      return { ...photo, fileSize: photo.fileSize.toString() };
    } catch (error) { await Promise.all(written.map((key) => this.storage.remove(key))); throw error; }
  }

  async batch(files: UploadFile[], metadata: PhotoMetadataDto, userId: string) {
    const results = [];
    for (const file of files) {
      try { results.push({ file: file.originalname, status: 'success', photo: await this.upload(file, metadata, userId) }); }
      catch (error) { const status = error instanceof ConflictException ? 'duplicate' : 'failed'; results.push({ file: file.originalname, status, message: error instanceof Error ? error.message : 'Upload failed' }); }
    }
    return { results, summary: { total: files.length, successful: results.filter((r) => r.status === 'success').length, duplicates: results.filter((r) => r.status === 'duplicate').length, failed: results.filter((r) => r.status === 'failed').length } };
  }

  async search(query: PhotoSearchDto, userId: string, canReview: boolean) {
    const start = query.year ? new Date(Date.UTC(query.year, 0, 1)) : query.from ? new Date(query.from) : undefined;
    const end = query.year ? new Date(Date.UTC(query.year + 1, 0, 1)) : query.to ? new Date(query.to) : undefined;
    const where: Prisma.PhotoWhereInput = {
      deletedAt: null,
      ...(canReview ? { status: query.status } : { OR: [{ status: PhotoStatus.APPROVED }, { uploadedById: userId, status: { in: [PhotoStatus.UPLOADED, PhotoStatus.PENDING_REVIEW, PhotoStatus.REJECTED] } }] }),
      projectId: query.projectId, eventId: query.eventId, uploadedById: query.uploadedBy,
      captureDate: start || end ? { gte: start, lt: end } : undefined,
      location: query.location ? { contains: query.location, mode: 'insensitive' } : undefined,
      department: query.department ? { contains: query.department, mode: 'insensitive' } : undefined,
      photographer: query.photographer ? { contains: query.photographer, mode: 'insensitive' } : undefined,
      event: query.activityTypeId ? { activityTypeId: query.activityTypeId } : undefined,
      tags: query.tag ? { some: { tag: { name: { equals: query.tag.toLowerCase(), mode: 'insensitive' } } } } : undefined,
      AND: query.q ? { OR: ['title', 'description', 'location', 'photographer'].map((field) => ({ [field]: { contains: query.q, mode: 'insensitive' } })) } : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.photo.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ captureDate: 'desc' }, { createdAt: 'desc' }], include: { project: true, event: true, tags: { include: { tag: true } }, uploadedBy: { select: { displayName: true } } } }),
      this.prisma.photo.count({ where }),
    ]);
    return pageResult(data.map((p) => ({ ...p, fileSize: p.fileSize.toString() })), total, query.page, query.pageSize);
  }

  async find(id: string, userId: string, canReview: boolean) {
    const photo = await this.prisma.photo.findFirst({ where: { id, deletedAt: null, ...(canReview ? {} : { OR: [{ status: PhotoStatus.APPROVED }, { uploadedById: userId }] }) }, include: { project: true, event: true, tags: { include: { tag: true } } } });
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }
  async review(id: string, status: PhotoStatus, userId: string, note?: string) { const photo = await this.prisma.photo.update({ where: { id }, data: { status, reviewedById: userId, reviewedAt: new Date(), reviewNote: note } }); await this.audit.record(userId, status, 'PHOTO', id, note ? { note } : undefined); return photo; }
  async update(id: string, dto: UpdatePhotoDto, userId: string, canReview: boolean) {
    const existing = await this.find(id, userId, canReview);
    if (!canReview && existing.uploadedById !== userId) throw new NotFoundException('Photo not found');
    const names = [...new Set((dto.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    const photo = await this.prisma.$transaction(async (tx) => {
      await tx.photoTag.deleteMany({ where: { photoId: id } });
      return tx.photo.update({ where: { id }, data: { title: dto.title, captureDate: new Date(dto.captureDate), projectId: dto.projectId ?? null, eventId: dto.eventId ?? null, description: dto.description, location: dto.location, photographer: dto.photographer, department: dto.department, remarks: dto.remarks, tags: names.length ? { create: names.map((name) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) } : undefined }, include: { tags: { include: { tag: true } } } });
    });
    await this.audit.record(userId, 'EDIT', 'PHOTO', id);
    return photo;
  }
  async softDelete(id: string, userId: string) { await this.prisma.photo.update({ where: { id }, data: { deletedAt: new Date() } }); await this.audit.record(userId, 'DELETE', 'PHOTO', id); }
  async recordDownload(id: string, userId: string) { await this.prisma.$transaction([this.prisma.downloadLog.create({ data: { userId, photoId: id, kind: 'SINGLE' } }), this.prisma.auditLog.create({ data: { userId, action: 'DOWNLOAD', entityType: 'PHOTO', entityId: id } })]); }
}
