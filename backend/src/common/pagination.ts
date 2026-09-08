import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 24;
}

export const pageResult = <T>(data: T[], total: number, page: number, pageSize: number) => ({
  data,
  meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
});
