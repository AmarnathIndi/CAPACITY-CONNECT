import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Governance & Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'ADMIN: Get operational metrics, enrollment charts, and score distribution' })
  async getDashboardStats() {
    return this.auditService.getDashboardStats();
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'ADMIN: Get immutable security audit trail with filters' })
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('search') search?: string,
  ) {
    return this.auditService.getAuditLogs(action, entity, search);
  }

  @Get('audit-log/export')
  @ApiOperation({ summary: 'ADMIN: Export audit log records as CSV file' })
  async exportCsv(@Res() res: Response) {
    const csvData = await this.auditService.exportAuditLogCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=imd-audit-log.csv');
    res.send(csvData);
  }
}
