import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        pointsLedger: true,
        certificates: { where: { status: 'VALID' } },
        enrollments: { include: { course: true } },
        userBadges: { include: { badge: true } },
      },
    });

    if (!user) {
      return null;
    }

    const totalPoints = user.pointsLedger.reduce((sum, item) => sum + item.points, 0);
    const completedCourses = user.enrollments.filter((e) => e.completed);
    const totalHours = completedCourses.reduce((sum, e) => sum + e.course.durationHours, 0);

    return {
      points: totalPoints,
      coursesCompleted: completedCourses.length,
      hoursLearned: totalHours,
      certificatesCount: user.certificates.length,
      learningStreakDays: 14,
      badges: user.userBadges.map((b) => ({
        id: b.badge.id,
        title: b.badge.titleEn,
        titleHi: b.badge.titleHi,
        icon: b.badge.icon,
        description: b.badge.description,
        awardedAt: b.awardedAt,
      })),
      recentActivity: user.pointsLedger.slice(-5).map((p) => ({
        reason: p.reason,
        points: p.points,
        date: p.createdAt.toISOString().split('T')[0],
      })),
    };
  }

  async getLeaderboard() {
    const offices = ['Delhi HQ', 'Chennai RMC', 'Guwahati NEC'];

    const officeRankings = [];

    for (const office of offices) {
      const users = await this.prisma.user.findMany({
        where: { office, status: 'APPROVED' },
        include: {
          pointsLedger: true,
          certificates: { where: { status: 'VALID' } },
        },
      });

      const totalOfficePoints = users.reduce(
        (sum, u) => sum + u.pointsLedger.reduce((pSum, p) => pSum + p.points, 0),
        0,
      );

      const totalCertificates = users.reduce((sum, u) => sum + u.certificates.length, 0);

      officeRankings.push({
        office,
        totalPoints: totalOfficePoints,
        activeLearners: users.length,
        certificatesIssued: totalCertificates,
        topPerformer: users.length > 0 ? users[0].fullName : 'N/A',
      });
    }

    // Sort by total points descending
    officeRankings.sort((a, b) => b.totalPoints - a.totalPoints);

    // Also get top individual officers
    const allUsers = await this.prisma.user.findMany({
      where: { status: 'APPROVED', role: 'TRAINEE' },
      include: { pointsLedger: true, profile: true },
    });

    const individualRankings = allUsers
      .map((u) => ({
        id: u.id,
        name: u.fullName,
        office: u.office,
        designation: u.profile?.designation || 'Meteorologist',
        points: u.pointsLedger.reduce((sum, p) => sum + p.points, 0),
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    return {
      officeLeaderboard: officeRankings,
      topLearners: individualRankings,
    };
  }

  async getAchievementsWall() {
    const recentCertificates = await this.prisma.certificate.findMany({
      where: { status: 'VALID' },
      include: { user: { select: { fullName: true, office: true } } },
      orderBy: { issueDate: 'desc' },
      take: 6,
    });

    return recentCertificates.map((c) => ({
      id: c.id,
      officerName: c.recipientName,
      office: c.user?.office || 'Delhi HQ',
      courseTitle: c.courseTitle,
      badge: 'Certified Operational Forecaster',
      date: c.issueDate.toISOString().split('T')[0],
      verificationUrl: `/verify/${c.id}`,
    }));
  }
}
