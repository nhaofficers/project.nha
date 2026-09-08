import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, ParseUUIDPipe, Post, Put, Query, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { validate } from 'class-validator';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { StorageService } from '../storage/storage.service';
import { PhotoMetadataDto, PhotoSearchDto, ReviewPhotoDto, UpdatePhotoDto } from './photos.dto';
import { PhotosService } from './photos.service';

@Controller()
export class PhotosController {
  constructor(private readonly photos: PhotosService, private readonly storage: StorageService) {}
  private async metadata(raw: string) { try { const dto = Object.assign(new PhotoMetadataDto(), JSON.parse(raw) as object); const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true }); if (errors.length) throw new BadRequestException('Photo metadata is invalid'); return dto; } catch (error) { if (error instanceof BadRequestException) throw error; throw new BadRequestException('metadata must be valid JSON'); } }
  private canReview(user: AuthUser) { return user.permissions.includes('PHOTO_APPROVE') || user.permissions.includes('PHOTO_REJECT'); }

  @Get('photos') @RequirePermissions('PHOTO_VIEW') async list(@Query() query: PhotoSearchDto, @Req() req: Request & { user: AuthUser }) { return this.photos.search(query, req.user.sub, this.canReview(req.user)); }
  @Get('search/photos') @RequirePermissions('PHOTO_VIEW') async search(@Query() query: PhotoSearchDto, @Req() req: Request & { user: AuthUser }) { return this.photos.search(query, req.user.sub, this.canReview(req.user)); }
  @Post('photos/upload') @RequirePermissions('PHOTO_UPLOAD') @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE ?? 15_728_640) } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body('metadata') raw: string, @Req() req: Request & { user: AuthUser }) { if (!file) throw new BadRequestException('Image file is required'); const metadata = await this.metadata(raw); if (metadata.retainOriginal && !req.user.permissions.includes('SYSTEM_SETTINGS')) throw new ForbiddenException('Original retention requires administrator permission'); return this.photos.upload(file, metadata, req.user.sub); }
  @Post('photos/batch-upload') @RequirePermissions('PHOTO_UPLOAD') @UseInterceptors(FilesInterceptor('files', 50, { storage: memoryStorage(), limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE ?? 15_728_640), files: 50 } }))
  async batch(@UploadedFiles() files: Express.Multer.File[], @Body('metadata') raw: string, @Req() req: Request & { user: AuthUser }) { if (!files?.length) throw new BadRequestException('At least one image is required'); const metadata = await this.metadata(raw); if (metadata.retainOriginal && !req.user.permissions.includes('SYSTEM_SETTINGS')) throw new ForbiddenException('Original retention requires administrator permission'); return this.photos.batch(files, metadata, req.user.sub); }
  @Get('photos/:id') @RequirePermissions('PHOTO_VIEW') async find(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }) { return this.photos.find(id, req.user.sub, this.canReview(req.user)); }
  @Put('photos/:id') @RequirePermissions('PHOTO_EDIT') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePhotoDto, @Req() req: Request & { user: AuthUser }) { return this.photos.update(id, dto, req.user.sub, this.canReview(req.user)); }
  @Get('photos/:id/thumbnail') @RequirePermissions('PHOTO_VIEW') async thumbnail(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }, @Res() res: Response) { const photo = await this.photos.find(id, req.user.sub, this.canReview(req.user)); if (!(await this.storage.exists(photo.thumbnailKey))) throw new NotFoundException('Thumbnail file is unavailable'); res.type('image/webp'); const stream = this.storage.stream(photo.thumbnailKey); stream.on('error', (error) => res.destroy(error)); stream.pipe(res); }
  @Get('photos/:id/download') @RequirePermissions('PHOTO_DOWNLOAD') async download(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }, @Res() res: Response) { const photo = await this.photos.find(id, req.user.sub, this.canReview(req.user)); if (!(await this.storage.exists(photo.storageKey))) throw new NotFoundException('Photo file is unavailable'); await this.photos.recordDownload(photo.id, req.user.sub); res.attachment(photo.systemFileName); res.type(photo.mimeType); const stream = this.storage.stream(photo.storageKey); stream.on('error', (error) => res.destroy(error)); stream.pipe(res); }
  @Post('photos/:id/approve') @RequirePermissions('PHOTO_APPROVE') approve(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewPhotoDto, @Req() req: Request & { user: AuthUser }) { return this.photos.review(id, 'APPROVED', req.user.sub, dto.note); }
  @Post('photos/:id/reject') @RequirePermissions('PHOTO_REJECT') reject(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewPhotoDto, @Req() req: Request & { user: AuthUser }) { return this.photos.review(id, 'REJECTED', req.user.sub, dto.note); }
  @Post('photos/:id/archive') @RequirePermissions('PHOTO_APPROVE') archive(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }) { return this.photos.review(id, 'ARCHIVED', req.user.sub); }
  @Delete('photos/:id') @RequirePermissions('PHOTO_DELETE') async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }) { await this.photos.softDelete(id, req.user.sub); return { success: true }; }
}
