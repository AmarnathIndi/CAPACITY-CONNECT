import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TestsService } from '../tests/tests.service';
import * as crypto from 'crypto';

interface OfflineSubmissionItem {
  id: string;
  testId: string;
  testTitle?: string;
  answers: { questionId: string; selectedOptionIndex: number }[];
  completedAt: string;
  clientSignature?: string;
}

@Injectable()
export class OfflineSyncService {
  private readonly secretKey =
    process.env.OFFLINE_TEST_SECRET || 'IMD_Offline_Test_Package_HMAC_Secret_2026!';

  constructor(
    private prisma: PrismaService,
    private testsService: TestsService,
  ) {}

  async generateOfflinePackage(testId: string, userId: string) {
    const test = await this.prisma.mCQTest.findUnique({
      where: { id: testId },
      include: {
        questions: {
          where: { status: 'APPROVED' },
          include: { options: true },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test ${testId} not found`);
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours validity

    const sanitizedQuestions = test.questions.map((q) => ({
      id: q.id,
      question: q.questionEn,
      questionHi: q.questionHi,
      difficulty: q.difficulty,
      options: q.options.map((opt) => opt.textEn),
      optionsHi: q.options.map((opt) => opt.textHi || opt.textEn),
    }));

    // Create HMAC signature of the package payload
    const payloadToSign = `${testId}:${userId}:${issuedAt.toISOString()}:${expiresAt.toISOString()}`;
    const hmac = crypto.createHmac('sha256', this.secretKey).update(payloadToSign).digest('hex');

    return {
      packageId: `PKG-${testId}-${Date.now()}`,
      testId: test.id,
      title: test.titleEn,
      titleHi: test.titleHi,
      durationMinutes: test.durationMinutes,
      passingScore: test.passingScore,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      signature: hmac,
      questions: sanitizedQuestions,
    };
  }

  async syncOfflineSubmissions(userId: string, items: OfflineSubmissionItem[]) {
    const syncResults = [];

    for (const item of items) {
      try {
        // Check if an attempt already exists
        const existingAttempt = await this.prisma.testAttempt.findFirst({
          where: {
            userId,
            testId: item.testId,
            isPassed: true,
          },
        });

        if (existingAttempt) {
          syncResults.push({
            id: item.id,
            testId: item.testId,
            status: 'ALREADY_COMPLETED',
            score: existingAttempt.score,
            isPassed: true,
            message: 'Examination already completed and passed.',
          });
          continue;
        }

        // Start a server attempt for grading record
        const startResult = await this.testsService.startAttempt(item.testId, userId);

        // Submit with offline flag
        const gradingResult = await this.testsService.submitAttempt(startResult.attemptId, userId, {
          answers: item.answers,
          isOffline: true,
          clientSignature: item.clientSignature,
          offlineCompletedAt: item.completedAt,
        });

        syncResults.push({
          id: item.id,
          testId: item.testId,
          status: 'SYNCED',
          score: gradingResult.score,
          isPassed: gradingResult.isPassed,
          certificateId: gradingResult.certificate?.id || null,
          message: gradingResult.isPassed
            ? `Successfully synced! Passed with ${gradingResult.score}%. Certificate issued.`
            : `Synced. Scored ${gradingResult.score}%. Passing mark was ${gradingResult.passingScore}%.`,
        });
      } catch (err) {
        syncResults.push({
          id: item.id,
          testId: item.testId,
          status: 'ERROR',
          message: err.message || 'Failed to sync offline examination submission.',
        });
      }
    }

    return {
      syncedCount: syncResults.filter((r) => r.status === 'SYNCED').length,
      totalReceived: items.length,
      results: syncResults,
    };
  }
}
