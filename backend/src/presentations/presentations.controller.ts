import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createReadStream } from 'node:fs';
import { RequirePermissions } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratePresentationDto, PresentationDto } from './presentations.dto';
import { PresentationsService } from './presentations.service';

@Controller()
export class PresentationsController {
  constructor(private readonly service: PresentationsService, private readonly prisma: PrismaService) {}
  @Get('presentation-templates') @RequirePermissions('PRESENTATION_CREATE') templates() { return this.prisma.presentationTemplate.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); }
  @Get('presentations') @RequirePermissions('PRESENTATION_CREATE') list() { return this.service.list(); }
  @Get('presentations/:id') @RequirePermissions('PRESENTATION_CREATE') find(@Param('id', ParseUUIDPipe) id: string) { return this.service.find(id); }
  @Post('presentations') @RequirePermissions('PRESENTATION_CREATE') create(@Body() dto: PresentationDto, @Req() req: Request & { user: AuthUser }) { return this.service.create(dto, req.user.sub); }
  @Put('presentations/:id') @RequirePermissions('PRESENTATION_EDIT') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PresentationDto) { return this.service.update(id, dto); }
  @Delete('presentations/:id') @RequirePermissions('PRESENTATION_EDIT') async remove(@Param('id', ParseUUIDPipe) id: string) { await this.service.remove(id); return { success: true }; }
  @Post('presentations/:id/generate') @RequirePermissions('PRESENTATION_GENERATE') async generate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: GeneratePresentationDto, @Req() req: Request & { user: AuthUser }, @Res() res: Response) { const file = await this.service.generate(id, req.user.sub, dto.archive); res.attachment(file.filename); res.type('application/vnd.openxmlformats-officedocument.presentationml.presentation'); createReadStream(file.path).pipe(res); }
  @Get('presentations/:id/download') @RequirePermissions('PRESENTATION_DOWNLOAD') async download(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: AuthUser }, @Res() res: Response) { const file = await this.service.generate(id, req.user.sub, false); res.attachment(file.filename); res.type('application/vnd.openxmlformats-officedocument.presentationml.presentation'); createReadStream(file.path).pipe(res); }
}
