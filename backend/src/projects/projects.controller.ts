import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

class ProjectDto {
  @IsString() @MaxLength(50) projectCode!: string;
  @IsString() @MaxLength(250) projectName!: string;
  @IsUUID() projectTypeId!: string;
  @IsUUID() projectStatusId!: string;
  @IsString() @MaxLength(250) location!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() responsibleOfficer?: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  @Get() @RequirePermissions('PROJECT_VIEW') list() { return this.prisma.project.findMany({ where: { deletedAt: null }, include: { projectType: true, projectStatus: true, _count: { select: { events: true, photos: true } } }, orderBy: { projectName: 'asc' } }); }
  @Get(':id') @RequirePermissions('PROJECT_VIEW') find(@Param('id', ParseUUIDPipe) id: string) { return this.prisma.project.findFirstOrThrow({ where: { id, deletedAt: null }, include: { projectType: true, projectStatus: true, events: { where: { deletedAt: null } } } }); }
  @Post() @RequirePermissions('PROJECT_CREATE') async create(@Body() dto: ProjectDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.project.create({ data: { ...dto, startDate: dto.startDate ? new Date(dto.startDate) : undefined, endDate: dto.endDate ? new Date(dto.endDate) : undefined, createdById: req.user.sub } }); await this.audit.record(req.user.sub, 'CREATE', 'PROJECT', item.id); return item; }
  @Put(':id') @RequirePermissions('PROJECT_EDIT') async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ProjectDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.project.update({ where: { id }, data: { ...dto, startDate: dto.startDate ? new Date(dto.startDate) : null, endDate: dto.endDate ? new Date(dto.endDate) : null } }); await this.audit.record(req.user.sub, 'EDIT', 'PROJECT', id); return item; }
  @Delete(':id') @RequirePermissions('PROJECT_DELETE') async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }) { await this.prisma.project.update({ where: { id }, data: { deletedAt: new Date() } }); await this.audit.record(req.user.sub, 'DELETE', 'PROJECT', id); return { success: true }; }
}
