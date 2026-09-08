import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { DownloadsController } from './downloads.controller';
import { PublicGalleryController } from './public-gallery.controller';

@Module({ controllers: [PhotosController, DownloadsController, PublicGalleryController], providers: [PhotosService], exports: [PhotosService] })
export class PhotosModule {}
