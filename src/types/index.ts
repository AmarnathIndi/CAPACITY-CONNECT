export type UserRole = 'trainee' | 'trainer' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface UserSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  verified: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  office: string; // e.g. "New Delhi HQ", "Chennai RMC", "Guwahati NEC"
  designation: string;
  avatar?: string;
  phone?: string;
  joinedDate: string;
  skills: UserSkill[];
  qualifications: string[];
  experienceYears: number;
  points: number;
  badges: string[];
  availability?: Record<string, string[]>; // Day -> ["09:00 - 11:00", "14:00 - 16:00"]
  languagePreferences: string[];
  rating?: number; // for trainers
}

export interface CourseModuleTranscript {
  time: string;
  text: string;
  textHi: string;
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'notes';
  contentUrl: string;
  duration: string;
  transcript?: CourseModuleTranscript[];
  notesContent?: string;
  downloadUrl?: string;
}

export interface CourseTrainer {
  trainerId: string;
  name?: string;
  trainerName?: string;
  designation?: string;
  office?: string;
  role: 'Lead' | 'Co-trainer';
  rating?: number;
  skills?: string[];
  status?: 'invited' | 'accepted' | 'declined';
}

export interface TrainerRating {
  trainerId: string;
  trainerName: string;
  rating: number;
  comment?: string;
}

export interface CourseRating {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  trainerRatings?: TrainerRating[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: 'Radar' | 'Cyclone' | 'NWP' | 'AWS' | 'Aviation' | 'Satellite' | 'Agromet' | 'Climate' | 'Instruments' | 'Ocean';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  trainers: CourseTrainer[];
  trainerId?: string;
  trainerName?: string;
  thumbnail: string;
  enrolledUsers: string[];
  completedUsers: string[];
  modules: CourseModule[];
  testId?: string;
  prerequisiteCourseId?: string;
  ratings: CourseRating[];
  tags: string[];
}

export interface MCQQuestion {
  id: string;
  question: string;
  questionHi: string;
  options: string[];
  optionsHi: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  approved?: boolean;
}

export interface MCQTest {
  id: string;
  title: string;
  titleHi: string;
  courseId: string;
  courseTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  passPercentage: number;
  questions: MCQQuestion[];
  deadline?: string;
  isAIgenerated?: boolean;
}

export interface TestResult {
  id: string;
  testId: string;
  courseId: string;
  userId: string;
  userName: string;
  office: string;
  score: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  trainers?: CourseTrainer[] | string[];
  userId: string;
  userName: string;
  userEmail: string;
  userOffice: string;
  userDesignation: string;
  issueDate: string;
  expiryDate: string;
  score: number;
  grade: 'Distinction' | 'First Class' | 'Pass';
  verificationHash: string;
  status?: 'valid' | 'expiring' | 'expired' | 'revoked';
}

export interface LiveSession {
  id: string;
  title: string;
  titleHi: string;
  trainerId: string;
  trainerName: string;
  trainers?: CourseTrainer[];
  date: string;
  time: string;
  duration: string;
  office: string;
  courseId?: string;
  status: 'scheduled' | 'live' | 'completed' | 'invited' | 'declined' | 'accepted';
  attendees: string[];
  recordingUrl?: string;
  hasTranscript: boolean;
  topic: string;
  targetRegion: string;
  language: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  date: string;
  priority: 'high' | 'normal' | 'urgent';
  author: string;
  category: 'notice' | 'achievement' | 'training';
}

export interface NotificationItem {
  id: string;
  userId: string; // user id or "all"
  title: string;
  titleHi?: string;
  message: string;
  messageHi?: string;
  date: string;
  read: boolean;
  type: 'course' | 'test' | 'approval' | 'certificate' | 'session' | 'system';
  link?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}

export interface OfflinePendingSync {
  id: string;
  testId: string;
  courseId: string;
  userId: string;
  userName: string;
  userOffice: string;
  answers: Record<string, number>;
  timestamp: string;
  status: 'pending' | 'synced';
}

export interface TrainerLibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'slides' | 'pdf' | 'notes' | 'video';
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  downloads: number;
  category: string;
}
