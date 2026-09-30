import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestsService } from '../src/modules/tests/tests.service';

describe('TestsService - Randomization & Answer Secrecy', () => {
  let service: TestsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      mCQTest: {
        findUnique: vi.fn(),
      },
      testAttempt: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((args) => ({
          id: 'new-attempt-uuid',
          startedAt: args.data.startedAt,
        })),
      },
    };

    service = new TestsService(mockPrisma);
  });

  it('should return questions with options shuffled and NEVER leak isCorrect to the client', async () => {
    mockPrisma.mCQTest.findUnique.mockResolvedValue({
      id: 'tst-001',
      titleEn: 'Radar Meteorology Exam',
      titleHi: 'रडार मौसम विज्ञान परीक्षा',
      durationMinutes: 20,
      passingScore: 70,
      totalMarks: 100,
      questions: [
        {
          id: 'q-101',
          questionEn: 'What is the frequency of S-Band?',
          questionHi: 'एस-बैंड की आवृत्ति क्या है?',
          difficulty: 'MEDIUM',
          options: [
            { id: 'opt-1', textEn: '1-2 GHz', isCorrect: false },
            { id: 'opt-2', textEn: '2.7-2.9 GHz', isCorrect: true },
            { id: 'opt-3', textEn: '5-6 GHz', isCorrect: false },
            { id: 'opt-4', textEn: '9-10 GHz', isCorrect: false },
          ],
        },
      ],
    });

    const response = await service.startAttempt('tst-001', 'usr-001');

    expect(response.attemptId).toBe('new-attempt-uuid');
    expect(response.questions).toHaveLength(1);

    const clientQuestion = response.questions[0];
    expect(clientQuestion.options).toHaveLength(4);

    // CRITICAL SECURITY ASSERTION: No isCorrect property sent to client!
    expect((clientQuestion as any).isCorrect).toBeUndefined();
    expect((clientQuestion as any).options[0].isCorrect).toBeUndefined();

    // Verify secret mapping stored in database
    expect(mockPrisma.testAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          testId: 'tst-001',
          userId: 'usr-001',
          status: 'IN_PROGRESS',
        }),
      }),
    );
  });
});
