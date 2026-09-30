import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoursesService } from '../src/modules/courses/courses.service';
import { BadRequestException } from '@nestjs/common';

describe('CoursesService - Prerequisites & Unlocking Logic', () => {
  let service: CoursesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      course: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
    };

    service = new CoursesService(mockPrisma);
  });

  it('should block enrollment if required prerequisite course is not completed', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'crs-002',
      titleEn: 'Tropical Cyclone Tracking',
      prerequisites: ['crs-001'],
    });

    // User has not completed crs-001
    mockPrisma.enrollment.findMany.mockResolvedValue([]);

    await expect(service.enrollCourse('crs-002', 'usr-101')).rejects.toThrow(BadRequestException);
    expect(mockPrisma.enrollment.upsert).not.toHaveBeenCalled();
  });

  it('should allow enrollment when all prerequisite courses have been completed', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'crs-002',
      titleEn: 'Tropical Cyclone Tracking',
      prerequisites: ['crs-001'],
    });

    // User completed crs-001
    mockPrisma.enrollment.findMany.mockResolvedValue([{ courseId: 'crs-001', completed: true }]);
    mockPrisma.enrollment.upsert.mockResolvedValue({
      id: 'enr-99',
      courseId: 'crs-002',
      userId: 'usr-101',
      progress: 10,
    });

    const result = await service.enrollCourse('crs-002', 'usr-101');
    expect(result.success).toBe(true);
    expect(mockPrisma.enrollment.upsert).toHaveBeenCalled();
  });
});
