import { create } from 'zustand';
import { Course, MCQTest, Certificate, LiveSession, Announcement, TrainerLibraryItem, CourseRating, TestResult } from '../types';
import initialCourses from '../data/courses.json';
import initialTests from '../data/tests.json';
import initialCertificates from '../data/certificates.json';
import initialSessions from '../data/sessions.json';
import initialAnnouncements from '../data/announcements.json';
import initialTrainerLibrary from '../data/trainerLibrary.json';
import { api, USE_MOCKS } from '../api/client';

interface CourseState {
  courses: Course[];
  tests: MCQTest[];
  certificates: Certificate[];
  sessions: LiveSession[];
  announcements: Announcement[];
  trainerLibrary: TrainerLibraryItem[];
  testResults: TestResult[];

  enrollCourse: (courseId: string, userId: string) => void;
  rateCourse: (courseId: string, rating: CourseRating) => void;
  submitTestResult: (result: Omit<TestResult, 'id' | 'completedAt'>) => { result: TestResult; certificate: Certificate | null };
  addCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  addTest: (test: MCQTest) => void;
  addSession: (session: LiveSession) => void;
  updateSessionStatus: (sessionId: string, status: LiveSession['status']) => void;
  addAnnouncement: (announcement: Announcement) => void;
  addTrainerLibraryItem: (item: TrainerLibraryItem) => void;
  getCertificateById: (id: string) => Certificate | undefined;
}

export const useCourseStore = create<CourseState>((set, get) => {
  const getSaved = <T>(key: string, fallback: T): T => {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback) && Array.isArray(parsed)) {
        if (parsed.length >= fallback.length) {
          return parsed as T;
        }
        return fallback;
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  };

  const courses = getSaved<Course[]>('capacity_connect_courses', initialCourses as Course[]);
  const tests = getSaved<MCQTest[]>('capacity_connect_tests', initialTests as MCQTest[]);
  const certificates = getSaved<Certificate[]>('capacity_connect_certificates', initialCertificates as Certificate[]);
  const sessions = getSaved<LiveSession[]>('capacity_connect_sessions', initialSessions as LiveSession[]);
  const announcements = getSaved<Announcement[]>('capacity_connect_announcements', initialAnnouncements as Announcement[]);
  const trainerLibrary = getSaved<TrainerLibraryItem[]>('capacity_connect_library', initialTrainerLibrary as TrainerLibraryItem[]);
  const testResults = getSaved<TestResult[]>('capacity_connect_results', []);

  const persist = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  return {
    courses,
    tests,
    certificates,
    sessions,
    announcements,
    trainerLibrary,
    testResults,

    enrollCourse: (courseId: string, userId: string) => {
      if (!USE_MOCKS) {
        api.courses.enroll(courseId).catch((err) => console.warn('[useCourseStore] API enroll:', err.message));
      }

      set((state) => {
        const updated = state.courses.map((c) => {
          if (c.id === courseId && !c.enrolledUsers.includes(userId)) {
            return { ...c, enrolledUsers: [...c.enrolledUsers, userId] };
          }
          return c;
        });
        persist('capacity_connect_courses', updated);
        return { courses: updated };
      });
    },

    rateCourse: (courseId: string, rating: CourseRating) => {
      if (!USE_MOCKS) {
        api.courses.rate(courseId, rating.rating, rating.comment).catch((err) => console.warn('[useCourseStore] API rate:', err.message));
      }

      set((state) => {
        const updated = state.courses.map((c) => {
          if (c.id === courseId) {
            const existingFiltered = c.ratings.filter((r) => r.userId !== rating.userId);
            return { ...c, ratings: [...existingFiltered, rating] };
          }
          return c;
        });
        persist('capacity_connect_courses', updated);
        return { courses: updated };
      });
    },

    submitTestResult: (resultData) => {
      const resultId = `res-${Date.now()}`;
      const now = new Date().toISOString();
      const course = get().courses.find((c) => c.id === resultData.courseId);

      let mintedCert: Certificate | null = null;

      if (resultData.passed) {
        // Mint certificate
        const certId = `IMD-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const issueDate = now.substring(0, 10);
        // Expiry in 3 years
        const expiryYear = new Date().getFullYear() + 3;
        const expiryDate = `${expiryYear}${issueDate.substring(4)}`;

        const grade =
          resultData.percentage >= 90
            ? 'Distinction'
            : resultData.percentage >= 75
            ? 'First Class'
            : 'Pass';

        // Cryptographic simulated SHA hash
        const verificationHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');

        mintedCert = {
          id: certId,
          courseId: resultData.courseId,
          courseTitle: course?.title || 'Operational Meteorological Course',
          courseCode: course?.code || 'CRS-IMD',
          userId: resultData.userId,
          userName: resultData.userName,
          userEmail: `${resultData.userName.toLowerCase().replace(/\s+/g, '.')}@imd.gov.in`,
          userOffice: resultData.office,
          userDesignation: 'Certified Meteorological Specialist',
          issueDate,
          expiryDate,
          score: resultData.percentage,
          grade,
          verificationHash
        };

        // Also mark course completed for user
        set((state) => {
          const updatedCourses = state.courses.map((c) => {
            if (c.id === resultData.courseId && !c.completedUsers.includes(resultData.userId)) {
              return { ...c, completedUsers: [...c.completedUsers, resultData.userId] };
            }
            return c;
          });
          const updatedCerts = [mintedCert!, ...state.certificates];
          persist('capacity_connect_courses', updatedCourses);
          persist('capacity_connect_certificates', updatedCerts);
          return { courses: updatedCourses, certificates: updatedCerts };
        });
      }

      const fullResult: TestResult = {
        ...resultData,
        id: resultId,
        completedAt: now,
        certificateId: mintedCert ? mintedCert.id : undefined
      };

      set((state) => {
        const updatedResults = [fullResult, ...state.testResults];
        persist('capacity_connect_results', updatedResults);
        return { testResults: updatedResults };
      });

      return { result: fullResult, certificate: mintedCert };
    },

    addCourse: (newCourse) => {
      set((state) => {
        const updated = [newCourse, ...state.courses];
        persist('capacity_connect_courses', updated);
        return { courses: updated };
      });
    },

    deleteCourse: (courseId) => {
      set((state) => {
        const updated = state.courses.filter((c) => c.id !== courseId);
        persist('capacity_connect_courses', updated);
        return { courses: updated };
      });
    },

    addTest: (newTest) => {
      set((state) => {
        const updated = [newTest, ...state.tests];
        persist('capacity_connect_tests', updated);
        return { tests: updated };
      });
    },

    addSession: (newSession) => {
      set((state) => {
        const updated = [newSession, ...state.sessions];
        persist('capacity_connect_sessions', updated);
        return { sessions: updated };
      });
    },

    updateSessionStatus: (sessionId, status) => {
      set((state) => {
        const updated = state.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s));
        persist('capacity_connect_sessions', updated);
        return { sessions: updated };
      });
    },

    addAnnouncement: (item) => {
      set((state) => {
        const updated = [item, ...state.announcements];
        persist('capacity_connect_announcements', updated);
        return { announcements: updated };
      });
    },

    addTrainerLibraryItem: (item) => {
      set((state) => {
        const updated = [item, ...state.trainerLibrary];
        persist('capacity_connect_library', updated);
        return { trainerLibrary: updated };
      });
    },

    getCertificateById: (id: string) => {
      return get().certificates.find(
        (c) => c.id.toLowerCase() === id.toLowerCase() || c.verificationHash.toLowerCase() === id.toLowerCase()
      );
    }
  };
});
