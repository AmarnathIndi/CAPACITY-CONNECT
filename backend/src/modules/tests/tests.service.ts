import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitTestAttemptDto, CreateTestPaperDto } from './dto/tests.dto';
import { CertificateStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async getTestMeta(testId: string) {
    const test = await this.prisma.mCQTest.findUnique({
      where: { id: testId },
      include: {
        course: { select: { titleEn: true, titleHi: true } },
        _count: { select: { questions: true } },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test ${testId} not found`);
    }

    return {
      id: test.id,
      courseId: test.courseId,
      courseTitle: test.course.titleEn,
      courseTitleHi: test.course.titleHi,
      title: test.titleEn,
      titleHi: test.titleHi,
      durationMinutes: test.durationMinutes,
      passingScore: test.passingScore,
      totalMarks: test.totalMarks,
      deadline: test.deadline,
      questionCount: test._count.questions,
    };
  }

  async startAttempt(testId: string, userId: string) {
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

    // Check deadline
    if (test.deadline && test.deadline < new Date()) {
      throw new BadRequestException('This examination deadline has expired. Submissions are closed.');
    }

    // Check if user already passed this test
    const existingPassed = await this.prisma.testAttempt.findFirst({
      where: {
        testId,
        userId,
        isPassed: true,
      },
    });

    if (existingPassed) {
      throw new BadRequestException('You have already passed this examination and earned a certificate.');
    }

    // Server-side Fisher-Yates randomization of questions
    const shuffledQuestions = [...test.questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    // Server-side randomization of options per question, keeping secret mapping
    const attemptMapping: Record<string, { optionId: string; isCorrect: boolean }[]> = {};
    const sanitizedQuestions = [];

    for (const q of shuffledQuestions) {
      const shuffledOptions = [...q.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      attemptMapping[q.id] = shuffledOptions.map((opt) => ({
        optionId: opt.id,
        isCorrect: opt.isCorrect,
      }));

      sanitizedQuestions.push({
        id: q.id,
        question: q.questionEn,
        questionHi: q.questionHi,
        difficulty: q.difficulty,
        // Crucial security: Never reveal isCorrect to client!
        options: shuffledOptions.map((opt) => opt.textEn),
        optionsHi: shuffledOptions.map((opt) => opt.textHi || opt.textEn),
      });
    }

    // Create TestAttempt record with startedAt timestamp and question mapping
    const attempt = await this.prisma.testAttempt.create({
      data: {
        testId,
        userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        answersPayload: attemptMapping,
      },
    });

    return {
      attemptId: attempt.id,
      testId: test.id,
      title: test.titleEn,
      titleHi: test.titleHi,
      durationMinutes: test.durationMinutes,
      passingScore: test.passingScore,
      totalMarks: test.totalMarks,
      startedAt: attempt.startedAt,
      questions: sanitizedQuestions,
    };
  }

  async submitAttempt(attemptId: string, userId: string, dto: SubmitTestAttemptDto) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { course: true, questions: { include: { options: true } } } },
        user: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Test attempt ${attemptId} not found`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('Unauthorized attempt submission');
    }

    // Idempotent: return result if already submitted
    if (attempt.status === 'SUBMITTED' && attempt.submittedAt) {
      return this.getAttemptResult(attemptId, userId);
    }

    const now = new Date();
    const durationAllowedMs = attempt.test.durationMinutes * 60 * 1000 + 60 * 1000; // 60s network grace period

    // Server-side timer validation (unless verified offline submission)
    if (!dto.isOffline) {
      const elapsedMs = now.getTime() - attempt.startedAt.getTime();
      if (elapsedMs > durationAllowedMs) {
        throw new BadRequestException('Test submission rejected: Examination time limit exceeded.');
      }
    }

    const mapping = (attempt.answersPayload as Record<string, { optionId: string; isCorrect: boolean }[]>) || {};
    let correctCount = 0;
    const totalQuestions = Object.keys(mapping).length;
    const reviewDetails = [];

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.selectedOptionIndex]));

    for (const q of attempt.test.questions) {
      const questionMapping = mapping[q.id];
      if (!questionMapping) continue;

      const selectedIdx = answerMap.get(q.id);
      let isAnswerCorrect = false;

      if (selectedIdx !== undefined && questionMapping[selectedIdx]) {
        isAnswerCorrect = questionMapping[selectedIdx].isCorrect;
      }

      if (isAnswerCorrect) {
        correctCount++;
      }

      // Find which index was correct in this randomized mapping
      const correctIdx = questionMapping.findIndex((opt) => opt.isCorrect);

      reviewDetails.push({
        questionId: q.id,
        question: q.questionEn,
        questionHi: q.questionHi,
        selectedOptionIndex: selectedIdx ?? null,
        correctOptionIndex: correctIdx,
        isCorrect: isAnswerCorrect,
        explanation: q.explanationEn,
        explanationHi: q.explanationHi,
        sourcePage: q.sourcePage,
      });
    }

    const scorePercentage = Math.round((correctCount / (totalQuestions || 1)) * 100);
    const isPassed = scorePercentage >= attempt.test.passingScore;

    // Update Attempt record
    await this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score: scorePercentage,
        isPassed,
        status: 'SUBMITTED',
        submittedAt: now,
        isOfflineSubmission: !!dto.isOffline,
        clientSignature: dto.clientSignature,
        answersPayload: {
          submittedAnswers: dto.answers,
          reviewDetails,
        },
      },
    });

    let certificate = null;

    // If passed: Auto-generate Certificate & Points
    if (isPassed) {
      const issueDate = now;
      const expiryDate = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years validity
      const certId = `CERT-IMD-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const verificationHash = crypto
        .createHash('sha256')
        .update(`${certId}-${userId}-${attempt.test.courseId}-${issueDate.toISOString()}`)
        .digest('hex');

      certificate = await this.prisma.certificate.upsert({
        where: { attemptId },
        update: {},
        create: {
          id: certId,
          verificationHash,
          userId,
          courseId: attempt.test.courseId,
          attemptId,
          recipientName: attempt.user.fullName,
          courseTitle: attempt.test.course.titleEn,
          issueDate,
          expiryDate,
          status: CertificateStatus.VALID,
        },
      });

      // Award Points idempotently
      const existingPoints = await this.prisma.pointsLedger.findFirst({
        where: {
          userId,
          reason: 'TEST_PASSED',
          referenceId: attempt.test.id,
        },
      });

      if (!existingPoints) {
        await this.prisma.pointsLedger.create({
          data: {
            userId,
            points: 100,
            reason: 'TEST_PASSED',
            referenceId: attempt.test.id,
          },
        });
      }

      // Mark enrollment completed
      await this.prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: attempt.test.courseId,
          },
        },
        update: { progress: 100, completed: true, completedAt: now },
        create: {
          userId,
          courseId: attempt.test.courseId,
          progress: 100,
          completed: true,
          completedAt: now,
        },
      });
    }

    return {
      attemptId,
      score: scorePercentage,
      passingScore: attempt.test.passingScore,
      isPassed,
      correctCount,
      totalQuestions,
      certificate: certificate
        ? {
            id: certificate.id,
            verificationHash: certificate.verificationHash,
            issueDate: certificate.issueDate,
            expiryDate: certificate.expiryDate,
            verificationUrl: `/verify/${certificate.id}`,
          }
        : null,
      review: reviewDetails,
    };
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { course: true } },
        certificate: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('Unauthorized result access');
    }

    const payload = attempt.answersPayload as any;

    return {
      attemptId: attempt.id,
      score: attempt.score,
      passingScore: attempt.test.passingScore,
      isPassed: attempt.isPassed,
      submittedAt: attempt.submittedAt,
      certificate: attempt.certificate
        ? {
            id: attempt.certificate.id,
            verificationHash: attempt.certificate.verificationHash,
            issueDate: attempt.certificate.issueDate,
            expiryDate: attempt.certificate.expiryDate,
            verificationUrl: `/verify/${attempt.certificate.id}`,
          }
        : null,
      review: payload?.reviewDetails || [],
    };
  }

  async getTestResultsForTrainer(testId: string) {
    const test = await this.prisma.mCQTest.findUnique({
      where: { id: testId },
      include: {
        attempts: {
          where: { status: 'SUBMITTED' },
          include: { user: true },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test ${testId} not found`);
    }

    return {
      testId: test.id,
      title: test.titleEn,
      passingScore: test.passingScore,
      totalSubmissions: test.attempts.length,
      passedCount: test.attempts.filter((a) => a.isPassed).length,
      averageScore:
        test.attempts.length > 0
          ? Math.round(test.attempts.reduce((sum, a) => sum + a.score, 0) / test.attempts.length)
          : 0,
      results: test.attempts.map((a) => ({
        attemptId: a.id,
        officerName: a.user.fullName,
        email: a.user.email,
        office: a.user.office,
        score: a.score,
        isPassed: a.isPassed,
        submittedAt: a.submittedAt,
        isOffline: a.isOfflineSubmission,
      })),
    };
  }

  async createTestPaper(dto: CreateTestPaperDto) {
    const test = await this.prisma.mCQTest.create({
      data: {
        id: dto.id,
        courseId: dto.courseId,
        titleEn: dto.titleEn,
        titleHi: dto.titleHi || dto.titleEn,
        durationMinutes: dto.durationMinutes || 20,
        passingScore: dto.passingScore || 70,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });

    if (dto.questions && Array.isArray(dto.questions)) {
      for (let i = 0; i < dto.questions.length; i++) {
        const q = dto.questions[i];
        const question = await this.prisma.mCQQuestion.create({
          data: {
            id: `${test.id}-q-${i + 1}`,
            testId: test.id,
            questionEn: q.question,
            questionHi: q.questionHi || q.question,
            difficulty: q.difficulty || 'MEDIUM',
            explanationEn: q.explanation || '',
            explanationHi: q.explanationHi || q.explanation || '',
            sourcePage: q.sourcePage || 'Module 1',
          },
        });

        if (q.options && Array.isArray(q.options)) {
          for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
            await this.prisma.mCQOption.create({
              data: {
                id: `${question.id}-opt-${optIdx}`,
                questionId: question.id,
                textEn: q.options[optIdx],
                textHi: q.optionsHi && q.optionsHi[optIdx] ? q.optionsHi[optIdx] : q.options[optIdx],
                isCorrect: optIdx === q.correctAnswer,
              },
            });
          }
        }
      }
    }

    return { success: true, test };
  }
}
