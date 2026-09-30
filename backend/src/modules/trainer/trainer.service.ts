import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  UpdateAvailabilityDto,
  CreateTrainingRequestDto,
  InviteTrainerDto,
  RespondInvitationDto,
} from './dto/trainer.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class TrainerService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(userId: string) {
    const slots = await this.prisma.trainerAvailability.findMany({
      where: { userId },
    });

    const acceptedSessions = await this.prisma.trainingSessionRequest.findMany({
      where: {
        trainerId: userId,
        status: SessionStatus.ACCEPTED,
      },
    });

    return {
      userId,
      slots: slots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        slot: s.slot,
        isBlocked: s.isBlocked,
      })),
      bookedSessions: acceptedSessions.map((s) => ({
        id: s.id,
        topic: s.topic,
        scheduledDate: s.scheduledDate,
        language: s.language,
        region: s.region,
      })),
    };
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    for (const s of dto.slots) {
      await this.prisma.trainerAvailability.upsert({
        where: {
          userId_dayOfWeek_slot: {
            userId,
            dayOfWeek: s.dayOfWeek,
            slot: s.slot,
          },
        },
        update: { isBlocked: s.isBlocked },
        create: {
          userId,
          dayOfWeek: s.dayOfWeek,
          slot: s.slot,
          isBlocked: s.isBlocked,
        },
      });
    }

    return { success: true, message: 'Availability schedule updated successfully' };
  }

  async matchTrainers(dto: CreateTrainingRequestDto) {
    const trainers = await this.prisma.user.findMany({
      where: { role: 'TRAINER', status: 'APPROVED' },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        authoredCourses: { include: { ratings: true } },
        availabilities: true,
        receivedInvites: { where: { status: SessionStatus.ACCEPTED } },
      },
    });

    const scheduledDate = new Date(dto.scheduledDate);
    const dayOfWeek = scheduledDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const topicLower = dto.topic.toLowerCase();

    const matches = [];

    for (const t of trainers) {
      let skillMatchScore = 20; // Base score
      let languageScore = 20;
      let ratingScore = 20;
      let availabilityScore = 15;
      let workloadScore = 15;

      // 1. Skill evaluation
      const hasSkill = t.skills.some((s) => topicLower.includes(s.skill.name.toLowerCase().split(' ')[0]));
      if (hasSkill) {
        skillMatchScore = 35;
      }

      // 2. Language match
      const preferredLang = (t.profile?.preferredLanguage || 'en').toLowerCase();
      if (dto.language && (preferredLang.includes(dto.language.toLowerCase()) || dto.language.toLowerCase() === 'english')) {
        languageScore = 20;
      } else {
        languageScore = 10;
      }

      // 3. Past ratings
      const allRatings = t.authoredCourses.flatMap((c) => c.ratings);
      let avgRating = 4.8;
      if (allRatings.length > 0) {
        avgRating = Number((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1));
      }
      ratingScore = Math.min(20, Math.round(avgRating * 4));

      // 4. Availability check
      const isDayBlocked = t.availabilities.some((a) => a.dayOfWeek === dayOfWeek && a.isBlocked);
      if (isDayBlocked) {
        availabilityScore = 5;
      } else {
        availabilityScore = 20;
      }

      // 5. Workload penalty
      const activeSessionsCount = t.receivedInvites.length;
      if (activeSessionsCount > 3) {
        workloadScore = 5;
      }

      const compositeScore = Math.min(99, skillMatchScore + languageScore + ratingScore + availabilityScore + workloadScore);

      matches.push({
        trainerId: t.id,
        name: t.fullName,
        email: t.email,
        office: t.office,
        region: t.region,
        designation: t.profile?.designation || 'Senior Meteorologist',
        rating: avgRating,
        compositeScore,
        scoreBreakdown: {
          skillMatch: skillMatchScore,
          languageFit: languageScore,
          pastRatings: ratingScore,
          calendarAvailability: availabilityScore,
          workloadBalance: workloadScore,
        },
        skills: t.skills.map((s) => s.skill.name),
        preferredLanguage: t.profile?.preferredLanguage || 'English',
      });
    }

    return matches.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  async inviteTrainer(adminId: string, dto: InviteTrainerDto) {
    const invite = await this.prisma.trainingSessionRequest.create({
      data: {
        adminId,
        trainerId: dto.trainerId,
        topic: dto.topic,
        scheduledDate: new Date(dto.scheduledDate),
        language: dto.language || 'English',
        region: dto.region || 'Delhi HQ',
        matchScore: dto.matchScore || 90,
        status: SessionStatus.INVITED,
      },
    });

    // Also send in-app notification to the trainer
    await this.prisma.notification.create({
      data: {
        userId: dto.trainerId,
        titleEn: `Training Session Invitation: ${dto.topic}`,
        titleHi: `प्रशिक्षण सत्र निमंत्रण: ${dto.topic}`,
        bodyEn: `You have been invited to conduct a training session on "${dto.topic}" on ${new Date(dto.scheduledDate).toLocaleDateString()}.`,
        bodyHi: `आपको "${dto.topic}" पर एक प्रशिक्षण सत्र आयोजित करने के लिए आमंत्रित किया गया है।`,
        type: 'INVITATION',
        linkUrl: '/trainer/invitations',
      },
    });

    return { success: true, message: 'Invitation dispatched to trainer', invite };
  }

  async getTrainerInvitations(trainerId: string) {
    const invites = await this.prisma.trainingSessionRequest.findMany({
      where: { trainerId },
      include: { admin: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map((inv) => ({
      id: inv.id,
      topic: inv.topic,
      scheduledDate: inv.scheduledDate,
      language: inv.language,
      region: inv.region,
      matchScore: inv.matchScore,
      status: inv.status,
      adminName: inv.admin.fullName,
      createdAt: inv.createdAt,
    }));
  }

  async respondInvitation(trainerId: string, inviteId: string, dto: RespondInvitationDto) {
    const invite = await this.prisma.trainingSessionRequest.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException(`Invitation ${inviteId} not found`);
    }

    if (invite.trainerId !== trainerId) {
      throw new BadRequestException('Unauthorized invitation response');
    }

    const updated = await this.prisma.trainingSessionRequest.update({
      where: { id: inviteId },
      data: { status: dto.status },
    });

    return {
      success: true,
      message: `Invitation ${dto.status.toLowerCase()} successfully`,
      invite: updated,
    };
  }

  async exportICalFeed(trainerId: string): Promise<string> {
    const sessions = await this.prisma.trainingSessionRequest.findMany({
      where: { trainerId, status: SessionStatus.ACCEPTED },
    });

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//India Meteorological Department//CAPACITY CONNECT//EN',
      'CALSCALE:GREGORIAN',
    ];

    for (const s of sessions) {
      const start = s.scheduledDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(s.scheduledDate.getTime() + 2 * 60 * 60 * 1000);
      const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:session-${s.id}@imd.gov.in`,
        `DTSTAMP:${start}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:IMD Training: ${s.topic}`,
        `DESCRIPTION:Training session in ${s.language} for ${s.region}`,
        `LOCATION:${s.region} Virtual Classroom`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      );
    }

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  }
}
