/**
 * CAPACITY CONNECT — TYPED REST API CLIENT
 * Air-gapped self-hosted backend integration for the India Meteorological Department
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('capacity_connect_access_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include httpOnly refresh cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      if (!USE_MOCKS) {
        console.warn(`[API Client] ${options.method || 'GET'} ${endpoint} error:`, err);
      }
      throw err;
    }
  }

  // --- Auth & Profile ---
  auth = {
    login: (data: { email: string; password?: string; totpCode?: string }) =>
      this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    signup: (data: any) =>
      this.request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

    logout: () =>
      this.request<any>('/auth/logout', { method: 'POST' }),

    refresh: () =>
      this.request<any>('/auth/refresh', { method: 'POST' }),

    forgotPassword: (email: string) =>
      this.request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

    resetPassword: (token: string, newPassword: string) =>
      this.request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

    changePassword: (oldPassword: string, newPassword: string) =>
      this.request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) }),

    setup2FA: () =>
      this.request<any>('/auth/2fa/setup', { method: 'POST' }),

    verify2FA: (totpCode: string) =>
      this.request<any>('/auth/2fa/verify', { method: 'POST', body: JSON.stringify({ totpCode }) }),
  };

  // --- Users & Directory ---
  users = {
    getMe: () => this.request<any>('/users/me'),

    updateProfile: (profile: any) =>
      this.request<any>('/users/me/profile', { method: 'PUT', body: JSON.stringify(profile) }),

    getPending: () => this.request<any[]>('/users/pending'),

    approve: (id: string, role: string, office?: string) =>
      this.request<any>(`/users/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ role: role.toUpperCase(), office }),
      }),

    reject: (id: string, reason: string) =>
      this.request<any>(`/users/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    getAll: (params?: { search?: string; role?: string; office?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/users${q ? `?${q}` : ''}`);
    },

    deleteUser: (id: string) =>
      this.request<any>(`/users/${id}`, { method: 'DELETE' }),

    bulkPreview: (rows: any[]) =>
      this.request<any>('/users/bulk-import/preview', {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }),

    bulkConfirm: (users: any[]) =>
      this.request<any>('/users/bulk-import/confirm', {
        method: 'POST',
        body: JSON.stringify({ users }),
      }),
  };

  // --- Courses & Curriculum ---
  courses = {
    getAll: (params?: { category?: string; search?: string; level?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/courses${q ? `?${q}` : ''}`);
    },

    getById: (id: string) => this.request<any>(`/courses/${id}`),

    enroll: (id: string) =>
      this.request<any>(`/courses/${id}/enroll`, { method: 'POST' }),

    updateProgress: (id: string, progress: number) =>
      this.request<any>(`/courses/${id}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ progress }),
      }),

    rate: (id: string, rating: number, feedback?: string) =>
      this.request<any>(`/courses/${id}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating, feedback }),
      }),

    create: (data: any) =>
      this.request<any>('/courses', { method: 'POST', body: JSON.stringify(data) }),

    getLibrary: (params?: { category?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/courses/library${q ? `?${q}` : ''}`);
    },

    uploadLibrary: (data: any) =>
      this.request<any>('/courses/library', { method: 'POST', body: JSON.stringify(data) }),
  };

  // --- Examinations & Tests ---
  tests = {
    getMeta: (id: string) => this.request<any>(`/tests/${id}`),

    startAttempt: (id: string) =>
      this.request<any>(`/tests/${id}/start`, { method: 'POST' }),

    submitAttempt: (attemptId: string, answers: any[], isOffline = false, clientSignature?: string) =>
      this.request<any>(`/tests/attempts/${attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, isOffline, clientSignature }),
      }),

    getAttemptResult: (attemptId: string) =>
      this.request<any>(`/tests/attempts/${attemptId}/result`),

    getResultsForTrainer: (id: string) =>
      this.request<any>(`/tests/${id}/results`),

    create: (data: any) =>
      this.request<any>('/tests', { method: 'POST', body: JSON.stringify(data) }),
  };

  // --- Certificates & Public Verification ---
  certificates = {
    getMy: () => this.request<any[]>('/certificates/my'),

    verify: (id: string) => this.request<any>(`/verify/${id}`),

    getTranscript: () => this.request<any>('/certificates/transcript'),

    downloadPdfUrl: (id: string) => `${API_BASE}/certificates/${id}/download`,

    revoke: (id: string, reason: string) =>
      this.request<any>(`/certificates/${id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  };

  // --- Skills & Expert Finder ---
  skills = {
    getAll: () => this.request<any[]>('/skills'),

    findExperts: (params?: { q?: string; language?: string; region?: string; minRating?: number }) => {
      const q = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/skills/expert-finder${q ? `?${q}` : ''}`);
    },

    getGapReport: () => this.request<any>('/skills/gap-report'),
  };

  // --- AI Course Assistant (RAG) ---
  aiAssistant = {
    chat: (question: string, courseId?: string) =>
      this.request<any>('/ai/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ question, courseId }),
      }),

    feedback: (question: string, helpful: boolean, comment?: string) =>
      this.request<any>('/ai/assistant/feedback', {
        method: 'POST',
        body: JSON.stringify({ question, helpful, comment }),
      }),
  };

  // --- AI Test Generator ---
  aiTestGen = {
    generate: (courseId: string, documentName?: string, questionCount = 8) =>
      this.request<any>('/ai/test-gen/generate', {
        method: 'POST',
        body: JSON.stringify({ courseId, documentName, questionCount }),
      }),

    getDrafts: (courseId?: string) => {
      const q = courseId ? `?courseId=${courseId}` : '';
      return this.request<any[]>(`/ai/test-gen/drafts${q}`);
    },

    updateDraft: (id: string, data: any) =>
      this.request<any>(`/ai/test-gen/drafts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    publishApproved: (testId: string, draftIds: string[]) =>
      this.request<any>('/ai/test-gen/publish', {
        method: 'POST',
        body: JSON.stringify({ testId, draftIds }),
      }),
  };

  // --- Personalized Learning Paths ---
  learningPaths = {
    getMyPath: () => this.request<any>('/learning-paths/my-path'),
  };

  // --- Gamification & Leaderboard ---
  gamification = {
    getMyProgress: () => this.request<any>('/gamification/my-progress'),

    getLeaderboard: () => this.request<any>('/gamification/leaderboard'),

    getAchievementsWall: () => this.request<any[]>('/gamification/achievements-wall'),
  };

  // --- Trainer Availability & Matching ---
  trainer = {
    getAvailability: () => this.request<any>('/trainer/availability'),

    updateAvailability: (slots: any[]) =>
      this.request<any>('/trainer/availability', {
        method: 'PUT',
        body: JSON.stringify({ slots }),
      }),

    match: (data: { topic: string; scheduledDate: string; language?: string; region?: string }) =>
      this.request<any[]>('/trainer/matching/suggest', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    invite: (data: any) =>
      this.request<any>('/trainer/sessions/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getInvitations: () => this.request<any[]>('/trainer/invitations'),

    respondInvitation: (id: string, status: string) =>
      this.request<any>(`/trainer/invitations/${id}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ status: status.toUpperCase() }),
      }),

    getICalUrl: () => `${API_BASE}/trainer/calendar/export.ics`,
  };

  // --- Live Virtual Classes (Jitsi) ---
  liveSessions = {
    getAll: (courseId?: string) => {
      const q = courseId ? `?courseId=${courseId}` : '';
      return this.request<any[]>(`/live-sessions${q}`);
    },

    getJoinToken: (id: string) => this.request<any>(`/live-sessions/${id}/token`),
  };

  // --- PWA & Offline Sync ---
  offlineSync = {
    getPackage: (testId: string) => this.request<any>(`/offline/package/${testId}`),

    sync: (submissions: any[]) =>
      this.request<any>('/offline/sync', {
        method: 'POST',
        body: JSON.stringify({ submissions }),
      }),
  };

  // --- Notifications & Announcements ---
  notifications = {
    getAll: () => this.request<any>('/notifications'),

    markRead: (id: string) =>
      this.request<any>(`/notifications/${id}/read`, { method: 'PUT' }),

    markAllRead: () =>
      this.request<any>('/notifications/read-all', { method: 'PUT' }),

    getAnnouncements: () => this.request<any[]>('/notifications/announcements'),

    createAnnouncement: (data: any) =>
      this.request<any>('/notifications/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // --- Admin & Governance ---
  admin = {
    getStats: () => this.request<any>('/admin/dashboard/stats'),

    getAuditLogs: (params?: { action?: string; entity?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/admin/audit-log${q ? `?${q}` : ''}`);
    },

    getAuditCsvUrl: () => `${API_BASE}/admin/audit-log/export`,
  };

  // --- Health Probe ---
  health = {
    check: () => this.request<any>('/health'),
  };
}

export const api = new ApiClient();
