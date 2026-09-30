import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestsService } from '../src/modules/tests/tests.service';
import { BadRequestException } from '@nestjs/common';

describe('TestsService - Grading & Timer Enforcement', () => {
  let service: TestsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      mCQTest: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      testAttempt: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
      },
      certificate: {
        upsert: vi.fn(),
      },
      pointsLedger: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      enrollment: {
        upsert: vi.fn(),
      },
    };

    service = new TestsService(mockPrisma);
  });

  it('should accurately grade a test and mark passed when score >= passingScore', async () => {
    const startedAt = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago

    mockPrisma.testAttempt.findUnique.mockResolvedValue({
      id: 'att-1',
      userId: 'usr-1',
      testId: 'tst-1',
      startedAt,
      status: 'IN_PROGRESS',
      answersPayload: {
        'q-1': [{ optionId: 'opt-1-0', isCorrect: false }, { optionId: 'opt-1-1', isCorrect: true }],
        'q-2': [{ optionId: 'opt-2-0', isCorrect: true }, { optionId: 'opt-2-1', isCorrect: false }],
      },
      test: {
        id: 'tst-1',
        courseId: 'crs-1',
        durationMinutes: 20,
        passingScore: 70,
        course: { titleEn: 'Doppler Radar Operations' },
        questions: [
          { id: 'q-1', questionEn: 'Question 1', explanationEn: 'Exp 1' },
          { id: 'q-2', questionEn: 'Question 2', explanationEn: 'Exp 2' },
        ],
      },
      user: { fullName: 'Dr. Aarav Sharma' },
    });

    mockPrisma.certificate.upsert.mockResolvedValue({
      id: 'CERT-IMD-2026-999',
      verificationHash: 'fake-hash',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
    });

    const result = await service.submitAttempt('att-1', 'usr-1', {
      answers: [
        { questionId: 'q-1', selectedOptionIndex: 1 }, // Correct
        { questionId: 'q-2', selectedOptionIndex: 0 }, // Correct
      ],
    });

    expect(result.score).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.correctCount).toBe(2);
    expect(result.certificate).not.toBeNull();
    expect(mockPrisma.certificate.upsert).toHaveBeenCalled();
  });

  it('should mark test as failed if score is below passingScore', async () => {
    const startedAt = new Date(Date.now() - 5 * 60 * 1000);

    mockPrisma.testAttempt.findUnique.mockResolvedValue({
      id: 'att-2',
      userId: 'usr-1',
      testId: 'tst-1',
      startedAt,
      status: 'IN_PROGRESS',
      answersPayload: {
        'q-1': [{ optionId: 'opt-1-0', isCorrect: false }, { optionId: 'opt-1-1', isCorrect: true }],
        'q-2': [{ optionId: 'opt-2-0', isCorrect: true }, { optionId: 'opt-2-1', isCorrect: false }],
      },
      test: {
        id: 'tst-1',
        courseId: 'crs-1',
        durationMinutes: 20,
        passingScore: 70,
        course: { titleEn: 'Doppler Radar Operations' },
        questions: [
          { id: 'q-1', questionEn: 'Question 1', explanationEn: 'Exp 1' },
          { id: 'q-2', questionEn: 'Question 2', explanationEn: 'Exp 2' },
        ],
      },
      user: { fullName: 'Dr. Aarav Sharma' },
    });

    const result = await service.submitAttempt('att-2', 'usr-1', {
      answers: [
        { questionId: 'q-1', selectedOptionIndex: 0 }, // Wrong
        { questionId: 'q-2', selectedOptionIndex: 1 }, // Wrong
      ],
    });

    expect(result.score).toBe(0);
    expect(result.isPassed).toBe(false);
    expect(result.certificate).toBeNull();
    expect(mockPrisma.certificate.upsert).not.toHaveBeenCalled();
  });

  it('should reject test submission if server-side timer has expired beyond grace period', async () => {
    const startedAt = new Date(Date.now() - 25 * 60 * 1000); // 25 mins ago (limit is 20 + 1 min grace)

    mockPrisma.testAttempt.findUnique.mockResolvedValue({
      id: 'att-3',
      userId: 'usr-1',
      testId: 'tst-1',
      startedAt,
      status: 'IN_PROGRESS',
      test: {
        durationMinutes: 20,
        course: { titleEn: 'Doppler Radar' },
        questions: [],
      },
      user: { fullName: 'Dr. Aarav Sharma' },
    });

    await expect(
      service.submitAttempt('att-3', 'usr-1', {
        answers: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
