import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './store/useAuthStore';
import { UserRole } from './types';

// Public & Common Pages
import { HomePage } from './pages/common/HomePage';
import { LoginPage } from './pages/common/LoginPage';
import { SignUpPage } from './pages/common/SignUpPage';
import { ForgotPasswordPage } from './pages/common/ForgotPasswordPage';
import { ProfilePage } from './pages/common/ProfilePage';
import { NotificationsPage } from './pages/common/NotificationsPage';
import { LiveSessionRoomPage } from './pages/common/LiveSessionRoomPage';
import { CertificateVerifyPage } from './pages/common/CertificateVerifyPage';

// Trainee Pages
import { TraineeCatalogPage } from './pages/trainee/TraineeCatalogPage';
import { TraineeCourseDetailPage } from './pages/trainee/TraineeCourseDetailPage';
import { TraineeCoursePlayerPage } from './pages/trainee/TraineeCoursePlayerPage';
import { TraineeTestPage } from './pages/trainee/TraineeTestPage';
import { TraineeProgressPage } from './pages/trainee/TraineeProgressPage';
import { TraineeLearningPathPage } from './pages/trainee/TraineeLearningPathPage';
import { TraineeLeaderboardPage } from './pages/trainee/TraineeLeaderboardPage';
import { TraineeCertificatesPage } from './pages/trainee/TraineeCertificatesPage';
import { TraineeTranscriptPage } from './pages/trainee/TraineeTranscriptPage';
import { TraineeProfileBuilderPage } from './pages/trainee/TraineeProfileBuilderPage';

// Trainer Pages
import { TrainerDashboardPage } from './pages/trainer/TrainerDashboardPage';
import { TrainerCourseCreatePage } from './pages/trainer/TrainerCourseCreatePage';
import { TrainerTestCreatePage } from './pages/trainer/TrainerTestCreatePage';
import { TrainerAITestGenPage } from './pages/trainer/TrainerAITestGenPage';
import { TrainerTestResultsPage } from './pages/trainer/TrainerTestResultsPage';
import { TrainerLibraryPage } from './pages/trainer/TrainerLibraryPage';
import { TrainerFeedbackPage } from './pages/trainer/TrainerFeedbackPage';
import { TrainerAvailabilityPage } from './pages/trainer/TrainerAvailabilityPage';
import { TrainerInvitationsPage } from './pages/trainer/TrainerInvitationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUserApprovalsPage } from './pages/admin/AdminUserApprovalsPage';
import { AdminUserManagementPage } from './pages/admin/AdminUserManagementPage';
import { AdminCourseManagementPage } from './pages/admin/AdminCourseManagementPage';
import { AdminBulkUploadPage } from './pages/admin/AdminBulkUploadPage';
import { AdminSkillExpertFinderPage } from './pages/admin/AdminSkillExpertFinderPage';
import { AdminTrainerMatchingPage } from './pages/admin/AdminTrainerMatchingPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { AdminLiveSessionsPage } from './pages/admin/AdminLiveSessionsPage';

// Role-based route guard
const RoleRoute: React.FC<{ allowedRole: UserRole; children: React.ReactNode }> = ({
  allowedRole,
  children
}) => {
  const { currentUser, demoLogin } = useAuthStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== allowedRole) {
    // Smoothly auto-switch persona if navigating directly via prototype link
    demoLogin(allowedRole);
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public & Common */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/live-session/:id" element={<LiveSessionRoomPage />} />
          <Route path="/verify/:id" element={<CertificateVerifyPage />} />

          {/* Trainee Routes */}
          <Route path="/trainee/catalog" element={<TraineeCatalogPage />} />
          <Route path="/trainee/course/:id" element={<TraineeCourseDetailPage />} />
          <Route path="/trainee/player/:id" element={<TraineeCoursePlayerPage />} />
          <Route path="/trainee/test/:id" element={<TraineeTestPage />} />
          <Route path="/trainee/progress" element={<TraineeProgressPage />} />
          <Route path="/trainee/learning-path" element={<TraineeLearningPathPage />} />
          <Route path="/trainee/leaderboard" element={<TraineeLeaderboardPage />} />
          <Route path="/trainee/certificates" element={<TraineeCertificatesPage />} />
          <Route path="/trainee/transcript" element={<TraineeTranscriptPage />} />
          <Route path="/trainee/profile-builder" element={<TraineeProfileBuilderPage />} />

          {/* Trainer Routes */}
          <Route
            path="/trainer/dashboard"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/courses/new"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerCourseCreatePage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/tests/new"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerTestCreatePage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/ai-test-generator"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerAITestGenPage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/results"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerTestResultsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/library"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerLibraryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/feedback"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerFeedbackPage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/availability"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerAvailabilityPage />
              </RoleRoute>
            }
          />
          <Route
            path="/trainer/invitations"
            element={
              <RoleRoute allowedRole="trainer">
                <TrainerInvitationsPage />
              </RoleRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRole="admin">
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <RoleRoute allowedRole="admin">
                <AdminUserApprovalsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRole="admin">
                <AdminUserManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <RoleRoute allowedRole="admin">
                <AdminCourseManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/bulk-upload"
            element={
              <RoleRoute allowedRole="admin">
                <AdminBulkUploadPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/expert-finder"
            element={
              <RoleRoute allowedRole="admin">
                <AdminSkillExpertFinderPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/trainer-matching"
            element={
              <RoleRoute allowedRole="admin">
                <AdminTrainerMatchingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <RoleRoute allowedRole="admin">
                <AdminAnnouncementsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/audit-log"
            element={
              <RoleRoute allowedRole="admin">
                <AdminAuditLogPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <RoleRoute allowedRole="admin">
                <AdminLiveSessionsPage />
              </RoleRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
