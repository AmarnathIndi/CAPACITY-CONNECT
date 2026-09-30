import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LiveSessionsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getSessions(courseId?: string) {
    const where: any = {};
    if (courseId) where.courseId = courseId;

    const sessions = await this.prisma.liveSession.findMany({
      where,
      orderBy: { startTime: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      title: s.title,
      trainerName: s.trainerName,
      startTime: s.startTime,
      endTime: s.endTime,
      jitsiRoomId: s.jitsiRoomId,
      status: s.status,
      attendanceCount: Array.isArray(s.attendanceList) ? s.attendanceList.length : 0,
      recordingAvailable: !!s.recordingKey,
    }));
  }

  async generateJitsiToken(sessionId: string, user: any) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const isModerator = user.role?.toUpperCase() === 'TRAINER' || user.role?.toUpperCase() === 'ADMIN';
    const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.imd.gov.in';

    const payload = {
      context: {
        user: {
          id: user.sub,
          name: user.name || user.email,
          email: user.email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'IMD')}`,
        },
        group: 'imd-staff',
      },
      aud: 'jitsi',
      iss: process.env.JITSI_APP_ID || 'capacity_connect',
      sub: jitsiDomain,
      room: session.jitsiRoomId,
      moderator: isModerator,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JITSI_APP_SECRET || 'IMD_Jitsi_Secret_Key_2026!',
      expiresIn: '4h',
    });

    // Record initial attendee entry
    const currentAttendance = (session.attendanceList as any[]) || [];
    if (!currentAttendance.some((a) => a.userId === user.sub)) {
      currentAttendance.push({
        userId: user.sub,
        officerName: user.name || user.email,
        email: user.email,
        role: user.role,
        joinedAt: new Date().toISOString(),
      });

      await this.prisma.liveSession.update({
        where: { id: sessionId },
        data: { attendanceList: currentAttendance },
      });
    }

    return {
      sessionId: session.id,
      roomId: session.jitsiRoomId,
      jitsiDomain,
      jwt: token,
      isModerator,
      joinUrl: `https://${jitsiDomain}/${session.jitsiRoomId}?jwt=${token}`,
    };
  }

  async handleJitsiWebhook(event: {
    event: string;
    room: string;
    participant?: any;
    recordingKey?: string;
  }) {
    const session = await this.prisma.liveSession.findFirst({
      where: { jitsiRoomId: event.room },
    });

    if (!session) return { received: true };

    if (event.event === 'RECORDING_COMPLETED' && event.recordingKey) {
      await this.prisma.liveSession.update({
        where: { id: session.id },
        data: {
          recordingKey: event.recordingKey,
          transcriptKey: `${event.recordingKey}.transcript.json`,
          status: 'COMPLETED',
        },
      });
    }

    return { received: true, sessionId: session.id };
  }
}
