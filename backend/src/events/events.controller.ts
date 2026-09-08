import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

class EventDto {
  @IsString() @MaxLength(50) eventCode!: string;
  @IsString() @MaxLength(250) eventName!: string;
  @IsUUID() eventTypeId!: string;
  @IsOptional() @IsUUID() activityTypeId?: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsDateString() eventDate!: string;
  @IsString() @MaxLength(250) location!: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsString() responsibleOfficer?: string;
  @IsOptional() @IsString() description?: string;
}

@Controller('events')
export class EventsController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  @Get() @RequirePermissions('EVENT_VIEW') list() { return this.prisma.event.findMany({ where: { deletedAt: null }, include: { eventType: true, activityType: true, project: true, _count: { select: { photos: true } } }, orderBy: { eventDate: 'desc' } }); }
  @Get(':id') @RequirePermissions('EVENT_VIEW') find(@Param('id', ParseUUIDPipe) id: string) { return this.prisma.event.findFirstOrThrow({ where: { id, deletedAt: null }, include: { eventType: true, activityType: true, project: true } }); }
  @Post() @RequirePermissions('EVENT_CREATE') async create(@Body() dto: EventDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.event.create({ data: { ...dto, eventDate: new Date(dto.eventDate), createdById: req.user.sub } }); await this.audit.record(req.user.sub, 'CREATE', 'EVENT', item.id); return item; }
  @Put(':id') @RequirePermissions('EVENT_EDIT') async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: EventDto, @Req() req: Request & { user: AuthUser }) { const item = await this.prisma.event.update({ where: { id }, data: { ...dto, eventDate: new Date(dto.eventDate) } }); await this.audit.record(req.user.sub, 'EDIT', 'EVENT', id); return item; }
  @Delete(':id') @RequirePermissions('EVENT_DELETE') async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }) { await this.prisma.event.update({ where: { id }, data: { deletedAt: new Date() } }); await this.audit.record(req.user.sub, 'DELETE', 'EVENT', id); return { success: true }; }
}
