import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(action?: string, entityType?: string, search?: string) {
    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = entityType.toUpperCase();
    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 200,
    });

    return logs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp.toISOString(),
      user: l.userEmail || 'System Process',
      ipAddress: l.ipAddress,
      action: l.action,
      entity: l.entityType,
      entityId: l.entityId,
      details: l.afterState ? JSON.stringify(l.afterState) : '',
    }));
  }

  async exportAuditLogCsv() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    const headers = ['Timestamp', 'User Email', 'IP Address', 'Action', 'Entity Type', 'Entity ID'];
    const rows = logs.map((l) => [
      l.timestamp.toISOString(),
      `"${l.userEmail || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.action || ''}"`,
      `"${l.entityType || ''}"`,
      `"${l.entityId || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count({ where: { status: 'APPROVED' } });
    const pendingUsers = await this.prisma.user.count({ where: { status: 'PENDING' } });
    const totalCourses = await this.prisma.course.count({ where: { status: 'PUBLISHED' } });
    const totalCertificates = await this.prisma.certificate.count({ where: { status: 'VALID' } });
    const totalEnrollments = await this.prisma.enrollment.count();

    const monthlyEnrollments = [
      { month: 'Apr', enrollments: 45, completions: 32 },
      { month: 'May', enrollments: 68, completions: 51 },
      { month: 'Jun', enrollments: 92, completions: 74 },
      { month: 'Jul', enrollments: 110, completions: 89 },
      { month: 'Aug', enrollments: 135, completions: 104 },
      { month: 'Sep', enrollments: 160, completions: 128 },
    ];

    const officeMetrics = [
      { name: 'Delhi HQ', enrolled: 120, completed: 98, rate: 82 },
      { name: 'Chennai RMC', enrolled: 95, completed: 78, rate: 82 },
      { name: 'Guwahati NEC', enrolled: 65, completed: 49, rate: 75 },
    ];

    const scoreDistribution = [
      { scoreRange: '90-100%', count: 48 },
      { scoreRange: '80-89%', count: 62 },
      { scoreRange: '70-79%', count: 35 },
      { scoreRange: '< 70% (Retest Needed)', count: 12 },
    ];

    return {
      overview: {
        totalUsers,
        pendingApprovals: pendingUsers,
        totalCourses,
        totalCertificates,
        totalEnrollments,
        avgPassingRate: 88,
      },
      monthlyEnrollments,
      officeMetrics,
      scoreDistribution,
    };
  }
}
