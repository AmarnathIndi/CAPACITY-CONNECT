import { PrismaClient, UserRole, UserStatus, CourseLevel, QuestionDifficulty, QuestionStatus, CertificateStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CAPACITY CONNECT database with IMD operational dataset...');

  // Path to frontend data json files
  const dataDir = path.resolve(__dirname, '../../../src/data');

  // 1. Seed Skills
  const skillsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills.json'), 'utf-8'));
  console.log(`Found ${skillsData.skills.length} skills to seed.`);
  for (const skill of skillsData.skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category, description: skill.category },
      create: {
        name: skill.name,
        category: skill.category,
        description: skill.category,
      },
    });
  }

  // 2. Seed Users
  const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8'));
  const defaultPasswordHash = await argon2.hash('imd@123');

  console.log(`Found ${usersData.length} users across Delhi HQ, Chennai RMC, and Guwahati NEC.`);
  for (const u of usersData) {
    const roleEnum = (u.role.toUpperCase() as UserRole) || UserRole.TRAINEE;
    const statusEnum = (u.status.toUpperCase() as UserStatus) || UserStatus.APPROVED;

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.name,
        role: roleEnum,
        status: statusEnum,
        office: u.office || 'Delhi HQ',
        region: u.office?.includes('Chennai') ? 'South' : u.office?.includes('Guwahati') ? 'North-East' : 'North',
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash: defaultPasswordHash,
        fullName: u.name,
        role: roleEnum,
        status: statusEnum,
        office: u.office || 'Delhi HQ',
        region: u.office?.includes('Chennai') ? 'South' : u.office?.includes('Guwahati') ? 'North-East' : 'North',
        twoFactorEnabled: roleEnum === UserRole.ADMIN,
      },
    });

    // Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        designation: u.designation,
        preferredLanguage: u.preferredLanguage || 'en',
        qualifications: u.qualifications || [],
        experience: u.experience || [],
        interests: u.interests || [],
        avatarUrl: u.avatarUrl,
      },
      create: {
        userId: user.id,
        designation: u.designation,
        preferredLanguage: u.preferredLanguage || 'en',
        qualifications: u.qualifications || [],
        experience: u.experience || [],
        interests: u.interests || [],
        avatarUrl: u.avatarUrl,
      },
    });

    // Seed User Skills if present
    if (u.skills && Array.isArray(u.skills)) {
      for (const s of u.skills) {
        const skillRec = await prisma.skill.findUnique({ where: { name: s.name } });
        if (skillRec) {
          await prisma.userSkill.upsert({
            where: {
              userId_skillId: {
                userId: user.id,
                skillId: skillRec.id,
              },
            },
            update: {
              level: s.level || 'Intermediate',
              verified: !!s.verified,
            },
            create: {
              userId: user.id,
              skillId: skillRec.id,
              level: s.level || 'Intermediate',
              verified: !!s.verified,
              verifiedAt: s.verified ? new Date() : null,
            },
          });
        }
      }
    }
  }

  // 3. Seed Courses
  const coursesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'courses.json'), 'utf-8'));
  console.log(`Found ${coursesData.length} operational courses to seed.`);
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { id: c.id },
      update: {
        titleEn: c.title,
        titleHi: c.titleHi || c.title,
        descriptionEn: c.description,
        descriptionHi: c.descriptionHi || c.description,
        category: c.category,
        level: (c.level?.toUpperCase() as CourseLevel) || CourseLevel.INTERMEDIATE,
        durationHours: parseInt(c.duration?.split(' ')[0], 10) || 10,
        thumbnail: c.thumbnail,
        prerequisites: c.prerequisites || [],
        targetRoles: c.targetRoles || [],
      },
      create: {
        id: c.id,
        titleEn: c.title,
        titleHi: c.titleHi || c.title,
        descriptionEn: c.description,
        descriptionHi: c.descriptionHi || c.description,
        category: c.category,
        level: (c.level?.toUpperCase() as CourseLevel) || CourseLevel.INTERMEDIATE,
        durationHours: parseInt(c.duration?.split(' ')[0], 10) || 10,
        thumbnail: c.thumbnail,
        prerequisites: c.prerequisites || [],
        targetRoles: c.targetRoles || [],
      },
    });

    // Modules
    if (c.modules && Array.isArray(c.modules)) {
      for (let i = 0; i < c.modules.length; i++) {
        const m = c.modules[i];
        await prisma.courseModule.upsert({
          where: { id: m.id },
          update: {
            titleEn: m.title,
            titleHi: m.titleHi || m.title,
            orderIndex: i + 1,
            materials: m.materials || [],
          },
          create: {
            id: m.id,
            courseId: course.id,
            titleEn: m.title,
            titleHi: m.titleHi || m.title,
            orderIndex: i + 1,
            materials: m.materials || [],
          },
        });
      }
    }
  }

  // 4. Seed Tests & Questions
  const testsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'tests.json'), 'utf-8'));
  console.log(`Found ${testsData.length} MCQ tests to seed.`);
  for (const t of testsData) {
    const test = await prisma.mCQTest.upsert({
      where: { id: t.id },
      update: {
        courseId: t.courseId,
        titleEn: t.title,
        titleHi: t.titleHi || t.title,
        durationMinutes: t.durationMinutes || 20,
        passingScore: t.passingScore || 70,
        totalMarks: t.totalMarks || 100,
        deadline: t.deadline ? new Date(t.deadline) : null,
      },
      create: {
        id: t.id,
        courseId: t.courseId,
        titleEn: t.title,
        titleHi: t.titleHi || t.title,
        durationMinutes: t.durationMinutes || 20,
        passingScore: t.passingScore || 70,
        totalMarks: t.totalMarks || 100,
        deadline: t.deadline ? new Date(t.deadline) : null,
      },
    });

    if (t.questions && Array.isArray(t.questions)) {
      for (const q of t.questions) {
        const question = await prisma.mCQQuestion.upsert({
          where: { id: q.id },
          update: {
            questionEn: q.question,
            questionHi: q.questionHi || q.question,
            difficulty: (q.difficulty?.toUpperCase() as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
            explanationEn: q.explanation || '',
            explanationHi: q.explanationHi || q.explanation || '',
            sourcePage: q.sourcePage || 'Page 12',
          },
          create: {
            id: q.id,
            testId: test.id,
            questionEn: q.question,
            questionHi: q.questionHi || q.question,
            difficulty: (q.difficulty?.toUpperCase() as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
            explanationEn: q.explanation || '',
            explanationHi: q.explanationHi || q.explanation || '',
            sourcePage: q.sourcePage || 'Page 12',
          },
        });

        // Seed Options
        if (q.options && Array.isArray(q.options)) {
          // Clear and recreate options for clean seed
          await prisma.mCQOption.deleteMany({ where: { questionId: question.id } });
          for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
            await prisma.mCQOption.create({
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
  }

  // 5. Seed Certificates
  const certsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'certificates.json'), 'utf-8'));
  console.log(`Found ${certsData.length} issued certificates to seed.`);
  for (const c of certsData) {
    await prisma.certificate.upsert({
      where: { id: c.id },
      update: {
        verificationHash: c.verificationHash || `HASH-${c.id}`,
        userId: c.userId,
        courseId: c.courseId,
        recipientName: c.recipientName,
        courseTitle: c.courseTitle,
        issueDate: new Date(c.issueDate),
        expiryDate: new Date(c.expiryDate),
        status: CertificateStatus.VALID,
      },
      create: {
        id: c.id,
        verificationHash: c.verificationHash || `HASH-${c.id}`,
        userId: c.userId,
        courseId: c.courseId,
        recipientName: c.recipientName,
        courseTitle: c.courseTitle,
        issueDate: new Date(c.issueDate),
        expiryDate: new Date(c.expiryDate),
        status: CertificateStatus.VALID,
      },
    });
  }

  // 6. Seed Announcements
  const announcementsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'announcements.json'), 'utf-8'));
  console.log(`Found ${announcementsData.length} announcements to seed.`);
  for (const a of announcementsData) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: {
        titleEn: a.title,
        titleHi: a.titleHi || a.title,
        summaryEn: a.summary,
        summaryHi: a.summaryHi || a.summary,
        category: a.category,
        publishedAt: new Date(a.date),
        isPinned: !!a.isPinned,
      },
      create: {
        id: a.id,
        titleEn: a.title,
        titleHi: a.titleHi || a.title,
        summaryEn: a.summary,
        summaryHi: a.summaryHi || a.summary,
        category: a.category,
        publishedAt: new Date(a.date),
        isPinned: !!a.isPinned,
      },
    });
  }

  console.log('✓ Seeding completed successfully! All IMD operational datasets loaded.');
}

main()
  .catch((e) => {
    console.error('Seeding encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
