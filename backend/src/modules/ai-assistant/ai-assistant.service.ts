import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssistantChatDto, AssistantFeedbackDto } from './dto/ai-assistant.dto';
import * as fs from 'fs';
import * as path from 'path';

interface QAPair {
  id: string;
  keywords: string[];
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  citation: {
    document?: string;
    page?: number;
    videoTimestamp?: string;
    courseId?: string;
    type: 'document' | 'video';
  };
}

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private qaDatabase: QAPair[] = [];

  constructor(private prisma: PrismaService) {
    this.loadQADatabase();
  }

  private loadQADatabase() {
    try {
      const qaPath = path.resolve(__dirname, '../../../../src/data/assistantQA.json');
      if (fs.existsSync(qaPath)) {
        this.qaDatabase = JSON.parse(fs.readFileSync(qaPath, 'utf-8'));
        this.logger.log(`Loaded ${this.qaDatabase.length} bilingual IMD meteorological Q&A citations`);
      }
    } catch (err) {
      this.logger.warn(`Could not load assistantQA.json: ${err.message}`);
    }
  }

  async answerQuestion(dto: AssistantChatDto, userId?: string) {
    const rawQuestion = dto.question.trim();

    // Guardrail 1: Prompt Injection Resistance
    const injectionPatterns = [
      /ignore\s+(all\s+)?previous\s+instructions/i,
      /system\s+override/i,
      /reveal\s+(system\s+)?prompt/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /disregard\s+prior/i,
    ];

    if (injectionPatterns.some((pattern) => pattern.test(rawQuestion))) {
      return {
        answer: 'Notice: In compliance with Government of India cybersecurity guidelines, external system override instructions are rejected. The IMD AI Course Assistant provides answers solely from official meteorological training literature.',
        answerHi: 'सूचना: भारत सरकार के साइबर सुरक्षा दिशानिर्देशों के अनुसार, सिस्टम ओवरराइड निर्देशों को अस्वीकार कर दिया गया है।',
        citations: [],
        found: false,
        guardrailTriggered: true,
      };
    }

    // Detect language: Hindi character range \u0900-\u097F
    const isHindi = /[\u0900-\u097F]/.test(rawQuestion);

    // Semantic keyword retrieval over official material
    const queryLower = rawQuestion.toLowerCase();
    let bestMatch: QAPair | null = null;
    let highestScore = 0;

    for (const item of this.qaDatabase) {
      let score = 0;
      for (const kw of item.keywords) {
        if (queryLower.includes(kw.toLowerCase())) {
          score += 10;
        }
      }
      if (item.questionEn.toLowerCase().includes(queryLower) || queryLower.includes(item.questionEn.toLowerCase())) {
        score += 25;
      }
      if (item.questionHi.includes(rawQuestion) || rawQuestion.includes(item.questionHi)) {
        score += 25;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    // If query match exceeds threshold
    if (bestMatch && highestScore >= 10) {
      const citationText =
        bestMatch.citation.type === 'document'
          ? `${bestMatch.citation.document}, Page ${bestMatch.citation.page}`
          : `Lecture: ${bestMatch.citation.document} (Timestamp: ${bestMatch.citation.videoTimestamp})`;

      const citationTextHi =
        bestMatch.citation.type === 'document'
          ? `${bestMatch.citation.document}, पृष्ठ ${bestMatch.citation.page}`
          : `व्याख्यान: ${bestMatch.citation.document} (समय: ${bestMatch.citation.videoTimestamp})`;

      return {
        answer: isHindi ? bestMatch.answerHi : bestMatch.answerEn,
        answerEn: bestMatch.answerEn,
        answerHi: bestMatch.answerHi,
        citations: [
          {
            source: isHindi ? citationTextHi : citationText,
            document: bestMatch.citation.document,
            page: bestMatch.citation.page,
            timestamp: bestMatch.citation.videoTimestamp,
            type: bestMatch.citation.type,
          },
        ],
        found: true,
        language: isHindi ? 'hi' : 'en',
      };
    }

    // Fallback: strictly declare not found in material
    return {
      answer:
        'This information is not found in the verified IMD course material. Please consult the Division Head or the Senior Meteorologist for guidance on this operational subject.',
      answerHi:
        'यह जानकारी आईएमडी की सत्यापित पाठ्यक्रम सामग्री में उपलब्ध नहीं है। कृपया इस परिचालन विषय पर मार्गदर्शन के लिए अपने प्रभाग प्रमुख या वरिष्ठ मौसम विज्ञानी से परामर्श लें।',
      citations: [],
      found: false,
      language: isHindi ? 'hi' : 'en',
    };
  }

  async recordFeedback(dto: AssistantFeedbackDto, userId?: string) {
    this.logger.log(`AI Assistant feedback from ${userId || 'anonymous'}: helpful=${dto.helpful}, query="${dto.question}"`);
    return {
      success: true,
      message: 'Feedback recorded for continuous model quality improvement.',
    };
  }
}
