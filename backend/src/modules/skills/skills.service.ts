import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async getAllSkills() {
    return this.prisma.skill.findMany({
      include: {
        _count: { select: { userSkills: true } },
      },
    });
  }

  async findExperts(query?: string, language?: string, region?: string, minRating?: number) {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'APPROVED',
        role: { in: ['TRAINER', 'TRAINEE'] },
      },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        authoredCourses: { include: { ratings: true } },
      },
    });

    const searchTerms = (query || '')
      .toLowerCase()
      .replace(/[?.,]/g, '')
      .split(/\s+/)
      .filter((term) => term.length > 2 && !['who', 'knows', 'find', 'the', 'expert', 'specialist'].includes(term));

    const rankedExperts = [];

    for (const u of users) {
      let score = 0;
      const matchedSkills: string[] = [];

      // Language filter
      if (language && language !== 'All') {
        const prefLang = u.profile?.preferredLanguage?.toLowerCase() || 'en';
        if (!prefLang.includes(language.toLowerCase())) {
          continue;
        }
      }

      // Region filter
      if (region && region !== 'All') {
        if (!u.office.includes(region) && !u.region.includes(region)) {
          continue;
        }
      }

      // Evaluate skill matches
      for (const us of u.skills) {
        const skillName = us.skill.name.toLowerCase();
        let isMatch = false;

        if (searchTerms.length === 0) {
          isMatch = true;
        } else {
          isMatch = searchTerms.some((term) => skillName.includes(term) || us.skill.category.toLowerCase().includes(term));
        }

        if (isMatch) {
          matchedSkills.push(`${us.skill.name} (${us.level})`);
          if (us.level === 'Expert') score += 40;
          else if (us.level === 'Advanced') score += 30;
          else score += 20;

          if (us.verified) score += 15;
        }
      }

      // Add points for trainer reputation
      let avgRating = 4.8;
      const allRatings = u.authoredCourses.flatMap((c) => c.ratings);
      if (allRatings.length > 0) {
        avgRating = Number((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1));
      }

      if (minRating && avgRating < minRating) {
        continue;
      }

      score += Math.round(avgRating * 5);

      if (score > 0 || !query) {
        rankedExperts.push({
          id: u.id,
          name: u.fullName,
          designation: u.profile?.designation || 'Meteorologist',
          office: u.office,
          region: u.region,
          role: u.role.toLowerCase(),
          email: u.email,
          matchedSkills,
          rating: avgRating,
          matchScore: Math.min(99, score),
          phone: u.profile?.phone || '+91 11 2461 1234',
        });
      }
    }

    return rankedExperts.sort((a, b) => b.matchScore - a.matchScore);
  }

  async getSkillGapReport() {
    const offices = ['Delhi HQ', 'Chennai RMC', 'Guwahati NEC'];
    const benchmarkSkills = [
      { name: 'Doppler Radar Operations', targetScore: 85 },
      { name: 'Tropical Cyclone Tracking', targetScore: 90 },
      { name: 'Numerical Weather Prediction (NWP)', targetScore: 80 },
      { name: 'Automatic Weather Station (AWS) Maintenance', targetScore: 75 },
      { name: 'Satellite Meteorology (INSAT-3D/3DR)', targetScore: 85 },
      { name: 'Agrometeorological Advisory', targetScore: 70 },
      { name: 'Aviation Meteorology', targetScore: 80 },
      { name: 'Monsoon Dynamics & Teleconnections', targetScore: 85 },
    ];

    const report = [];

    for (const office of offices) {
      const officeUsers = await this.prisma.user.findMany({
        where: { office, status: 'APPROVED' },
        include: { skills: { include: { skill: true } } },
      });

      const skillScores: Record<string, number> = {};

      for (const bm of benchmarkSkills) {
        let totalSkillLevel = 0;
        let certifiedStaff = 0;

        for (const user of officeUsers) {
          const userSkill = user.skills.find((s) => s.skill.name.toLowerCase().includes(bm.name.toLowerCase().split(' ')[0]));
          if (userSkill) {
            certifiedStaff++;
            if (userSkill.level === 'Expert') totalSkillLevel += 95;
            else if (userSkill.level === 'Advanced') totalSkillLevel += 80;
            else totalSkillLevel += 60;
          }
        }

        const avgScore = officeUsers.length > 0 ? Math.round(totalSkillLevel / officeUsers.length) : 50;
        skillScores[bm.name] = Math.min(100, Math.max(30, avgScore));
      }

      report.push({
        office,
        staffCount: officeUsers.length,
        skills: skillScores,
      });
    }

    return {
      benchmarkSkills,
      matrix: report,
    };
  }
}
