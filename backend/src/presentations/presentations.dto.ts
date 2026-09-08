import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SlideDto {
  @IsInt() @Min(1) position!: number;
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsString() @MaxLength(500) caption?: string;
  @IsArray() @IsUUID(undefined, { each: true }) photoIds!: string[];
}
export class PresentationDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(300) subtitle?: string;
  @IsUUID() templateId!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SlideDto) slides!: SlideDto[];
}
export class GeneratePresentationDto { @IsOptional() @IsBoolean() archive?: boolean; }
