import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LearningPathsService {
  constructor(private prisma: PrismaService) {}

  async getUserLearningPath(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: { include: { course: true } },
        skills: { include: { skill: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Default IMD Operational Met Pathway
    const pathStages = [
      {
        step: 1,
        courseId: 'crs-004',
        title: 'Automatic Weather Station (AWS) Maintenance & Calibration',
        titleHi: 'स्वचालित मौसम स्टेशन (AWS) रखरखाव और अंशांकन',
        category: 'Surface Meteorology',
        level: 'BEGINNER',
        duration: '10 Hours',
        requiredForNext: true,
      },
      {
        step: 2,
        courseId: 'crs-001',
        title: 'Doppler Weather Radar (DWR) Operational Principles',
        titleHi: 'डॉप्लर मौसम रडार (DWR) परिचालन सिद्धांत',
        category: 'Radar Meteorology',
        level: 'INTERMEDIATE',
        duration: '15 Hours',
        prerequisiteId: 'crs-004',
        requiredForNext: true,
      },
      {
        step: 3,
        courseId: 'crs-002',
        title: 'Tropical Cyclone Tracking & Intensity Forecasting',
        titleHi: 'उष्णकटिबंधीय चक्रवात ट्रैकिंग और तीव्रता पूर्वानुमान',
        category: 'Severe Weather',
        level: 'ADVANCED',
        duration: '20 Hours',
        prerequisiteId: 'crs-001',
        requiredForNext: true,
      },
      {
        step: 4,
        courseId: 'crs-003',
        title: 'Numerical Weather Prediction (NWP) Data Assimilation',
        titleHi: 'संख्यात्मक मौसम भविष्यवाणी (NWP) डेटा समावेशन',
        category: 'Modeling',
        level: 'ADVANCED',
        duration: '18 Hours',
        prerequisiteId: 'crs-002',
        requiredForNext: false,
      },
    ];

    const completedCourseIds = new Set(
      user.enrollments.filter((e) => e.completed).map((e) => e.courseId),
    );

    let completedCount = 0;

    const stagesWithStatus = pathStages.map((stage) => {
      const isCompleted = completedCourseIds.has(stage.courseId);
      if (isCompleted) completedCount++;

      let isUnlocked = false;
      if (!stage.prerequisiteId || completedCourseIds.has(stage.prerequisiteId)) {
        isUnlocked = true;
      }

      return {
        ...stage,
        isCompleted,
        isUnlocked,
        isLocked: !isUnlocked,
        status: isCompleted ? 'COMPLETED' : isUnlocked ? 'UNLOCKED' : 'LOCKED',
      };
    });

    const progressPct = Math.round((completedCount / pathStages.length) * 100);

    return {
      pathTitle: 'IMD Operational Forecaster & Radar Specialist Track',
      pathTitleHi: 'आईएमडी परिचालन पूर्वानुमानकर्ता और रडार विशेषज्ञ ट्रैक',
      role: user.role,
      office: user.office,
      totalSteps: pathStages.length,
      completedSteps: completedCount,
      progressPercentage: progressPct,
      stages: stagesWithStatus,
    };
  }
}
