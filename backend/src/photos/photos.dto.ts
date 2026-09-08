import { PhotoStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationDto } from '../common/pagination';

export class PhotoMetadataDto {
  @IsString() @MaxLength(200) title!: string;
  @IsDateString() captureDate!: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() eventId?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(250) location?: string;
  @IsOptional() @IsString() @MaxLength(250) photographer?: string;
  @IsOptional() @IsString() @MaxLength(250) department?: string;
  @IsOptional() @IsString() @MaxLength(1000) remarks?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @Type(() => Boolean) @IsBoolean() retainOriginal?: boolean;
}

export class PhotoSearchDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() eventId?: string;
  @IsOptional() @IsUUID() activityTypeId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) year?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsString() photographer?: string;
  @IsOptional() @IsUUID() uploadedBy?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsEnum(PhotoStatus) status?: PhotoStatus;
}

export class ReviewPhotoDto { @IsOptional() @IsString() @MaxLength(1000) note?: string; }
export class UpdatePhotoDto {
  @IsString() @MaxLength(200) title!: string;
  @IsDateString() captureDate!: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() eventId?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(250) location?: string;
  @IsOptional() @IsString() @MaxLength(250) photographer?: string;
  @IsOptional() @IsString() @MaxLength(250) department?: string;
  @IsOptional() @IsString() @MaxLength(1000) remarks?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
export class ZipDownloadDto { @IsArray() @IsUUID(undefined, { each: true }) photoIds!: string[]; }
