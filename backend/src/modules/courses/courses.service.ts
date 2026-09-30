import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto, CreateRatingDto, UploadLibraryItemDto } from './dto/courses.dto';
import { CourseLevel } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async getAllCourses(category?: string, search?: string, level?: string, userId?: string) {
    const where: any = { status: 'PUBLISHED' };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (level && level !== 'All') {
      where.level = level.toUpperCase() as CourseLevel;
    }

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleHi: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const courses = await this.prisma.course.findMany({
      where,
      include: {
        modules: true,
        ratings: true,
        enrollments: userId ? { where: { userId } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses.map((c) => {
      const avgRating =
        c.ratings.length > 0
          ? Number((c.ratings.reduce((sum, r) => sum + r.rating, 0) / c.ratings.length).toFixed(1))
          : 4.8;
      const userEnrollment = c.enrollments && c.enrollments.length > 0 ? c.enrollments[0] : null;

      return {
        id: c.id,
        title: c.titleEn,
        titleHi: c.titleHi,
        description: c.descriptionEn,
        descriptionHi: c.descriptionHi,
        category: c.category,
        level: c.level,
        duration: `${c.durationHours} Hours`,
        thumbnail: c.thumbnail,
        modulesCount: c.modules.length,
        rating: avgRating,
        ratingCount: c.ratings.length,
        isEnrolled: !!userEnrollment,
        progress: userEnrollment ? userEnrollment.progress : 0,
        completed: userEnrollment ? userEnrollment.completed : false,
        prerequisites: c.prerequisites,
      };
    });
  }

  async getCourseById(courseId: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { orderBy: { orderIndex: 'asc' } },
        ratings: { orderBy: { createdAt: 'desc' }, take: 10 },
        tests: true,
        enrollments: userId ? { where: { userId } } : false,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const userEnrollment = course.enrollments && course.enrollments.length > 0 ? course.enrollments[0] : null;

    // Check prerequisites
    const prereqList = (course.prerequisites as string[]) || [];
    let prerequisitesMet = true;
    const unmetPrerequisites: string[] = [];

    if (userId && prereqList.length > 0) {
      const completedCourses = await this.prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: prereqList },
          completed: true,
        },
        select: { courseId: true },
      });
      const completedIds = new Set(completedCourses.map((e) => e.courseId));
      for (const pr of prereqList) {
        if (!completedIds.has(pr)) {
          prerequisitesMet = false;
          unmetPrerequisites.push(pr);
        }
      }
    }

    const avgRating =
      course.ratings.length > 0
        ? Number((course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length).toFixed(1))
        : 4.8;

    return {
      id: course.id,
      title: course.titleEn,
      titleHi: course.titleHi,
      description: course.descriptionEn,
      descriptionHi: course.descriptionHi,
      category: course.category,
      level: course.level,
      duration: `${course.durationHours} Hours`,
      thumbnail: course.thumbnail,
      modules: course.modules,
      tests: course.tests.map((t) => ({
        id: t.id,
        title: t.titleEn,
        titleHi: t.titleHi,
        durationMinutes: t.durationMinutes,
        passingScore: t.passingScore,
        deadline: t.deadline,
      })),
      rating: avgRating,
      ratings: course.ratings,
      isEnrolled: !!userEnrollment,
      progress: userEnrollment ? userEnrollment.progress : 0,
      completed: userEnrollment ? userEnrollment.completed : false,
      prerequisites: prereqList,
      prerequisitesMet,
      unmetPrerequisites,
    };
  }

  async enrollCourse(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    // Verify prerequisites
    const prereqList = (course.prerequisites as string[]) || [];
    if (prereqList.length > 0) {
      const completedPrereqs = await this.prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: prereqList },
          completed: true,
        },
        select: { courseId: true },
      });
      const completedIds = new Set(completedPrereqs.map((e) => e.courseId));
      const missing = prereqList.filter((p) => !completedIds.has(p));
      if (missing.length > 0) {
        throw new BadRequestException(
          `Prerequisite requirement not satisfied. You must complete course(s) [${missing.join(', ')}] prior to enrolling.`,
        );
      }
    }

    const enrollment = await this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: { lastAccessedAt: new Date() },
      create: {
        userId,
        courseId,
        progress: 10, // Started enrollment
      },
    });

    return {
      success: true,
      message: `Enrolled successfully in ${course.titleEn}`,
      enrollment,
    };
  }

  async updateProgress(courseId: string, userId: string, progress: number) {
    const isCompleted = progress >= 100;

    const enrollment = await this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress: Math.min(100, Math.max(0, progress)),
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        lastAccessedAt: new Date(),
      },
    });

    // If completed, award course completion points idempotently
    if (isCompleted) {
      const existingPoints = await this.prisma.pointsLedger.findFirst({
        where: {
          userId,
          reason: 'COURSE_COMPLETION',
          referenceId: courseId,
        },
      });

      if (!existingPoints) {
        await this.prisma.pointsLedger.create({
          data: {
            userId,
            points: 150,
            reason: 'COURSE_COMPLETION',
            referenceId: courseId,
          },
        });
      }
    }

    return { success: true, enrollment };
  }

  async rateCourse(courseId: string, userId: string, dto: CreateRatingDto) {
    const rating = await this.prisma.courseRating.create({
      data: {
        courseId,
        userId,
        rating: dto.rating,
        feedback: dto.feedback,
      },
    });

    return { success: true, rating };
  }

  async createCourse(trainerId: string, dto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: {
        id: dto.id,
        titleEn: dto.titleEn,
        titleHi: dto.titleHi || dto.titleEn,
        descriptionEn: dto.descriptionEn,
        descriptionHi: dto.descriptionHi || dto.descriptionEn,
        category: dto.category,
        level: dto.level || CourseLevel.INTERMEDIATE,
        durationHours: dto.durationHours || 10,
        thumbnail: dto.thumbnail,
        trainerId,
        prerequisites: dto.prerequisites || [],
      },
    });

    if (dto.modules && Array.isArray(dto.modules)) {
      for (let i = 0; i < dto.modules.length; i++) {
        const m = dto.modules[i];
        await this.prisma.courseModule.create({
          data: {
            id: m.id || `${course.id}-mod-${i + 1}`,
            courseId: course.id,
            titleEn: m.titleEn || m.title,
            titleHi: m.titleHi || m.titleEn || m.title,
            orderIndex: i + 1,
            materials: m.materials || [],
          },
        });
      }
    }

    return { success: true, course };
  }

  async getLibraryItems(category?: string, search?: string) {
    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleHi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.trainerLibraryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      title: item.titleEn,
      titleHi: item.titleHi,
      category: item.category,
      format: item.format,
      fileSize: item.fileSize,
      uploaderName: item.uploaderName,
      downloads: item.downloads,
      date: item.createdAt.toISOString().split('T')[0],
      downloadUrl: `/api/v1/courses/materials/download/${item.id}`,
    }));
  }

  async addLibraryItem(uploaderName: string, dto: UploadLibraryItemDto) {
    const item = await this.prisma.trainerLibraryItem.create({
      data: {
        id: dto.id,
        titleEn: dto.titleEn,
        titleHi: dto.titleHi || dto.titleEn,
        category: dto.category,
        format: dto.format,
        fileSize: dto.fileSize,
        uploaderName,
      },
    });

    return { success: true, item };
  }

  async getPresignedDownloadUrl(fileKey: string) {
    const minioHost = process.env.STORAGE_PUBLIC_URL || 'http://localhost:9000/imd-capacity-connect';
    return {
      downloadUrl: `${minioHost}/${encodeURIComponent(fileKey)}`,
      expiresInSeconds: 3600,
    };
  }
}
