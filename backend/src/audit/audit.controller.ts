import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../auth/auth.decorators';
import { PaginationDto, pageResult } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() @RequirePermissions('AUDIT_VIEW')
  async list(@Query() query: PaginationDto) {
    const where = {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: { createdAt: 'desc' }, include: { user: { select: { displayName: true, email: true } } } }),
      this.prisma.auditLog.count({ where }),
    ]);
    return pageResult(data.map((item) => ({ ...item, id: item.id.toString() })), total, query.page, query.pageSize);
  }
}
