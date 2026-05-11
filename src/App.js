import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/auth/LandingPage/LandingPage';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import Welcome from './pages/auth/Welcome/Welcome';
import MainLayout from './components/layout/student/MainLayout/MainLayout';

// ── Student Pages ────────────────────────────────────────────────────
import ProfilePage from './pages/students/ProfilePage';
import InternshipProgressPage from './pages/students/InternshipProgressPage';
import GradesEvaluationsPage from './pages/students/GradesEvaluationsPage';
import NotificationsPage from './pages/students/NotificationsPage';
import DashboardPage from './pages/students/DashboardPage';

// ── OJT Head Pages ───────────────────────────────────────────────────
import OjtProfessorLayout from './components/layout/ojt-professor/OjtProfessorLayout';
import OjtProfessorDashboardPage from './pages/ojt-professor/DashboardPage';
import StudentDirectoryPage from './pages/ojt-professor/StudentDirectoryPage';
import DocumentReviewPage from './pages/ojt-professor/DocumentReviewPage';
import WARReviewPage from './pages/ojt-professor/WARReviewPage';
import ProgressMonitoringPage from './pages/ojt-professor/ProgressMonitoringPage';
import CompletionValidationPage from './pages/ojt-professor/CompletionValidationPage';
import VisitItineraryPage from './pages/ojt-professor/VisitItineraryPage';
import GradeManagementPage from './pages/ojt-professor/GradeManagementPage';
import ReportsDashboardPage from './pages/ojt-professor/ReportsDashboardPage';
import OjtProfessorNotificationsPage from './pages/ojt-professor/NotificationsPage';
import OjtProfessorProfilePage from './pages/ojt-professor/ProfilePage';
import OjtProfessorStudentProfilePage from './pages/ojt-professor/StudentProfilePage';

// ── Admin Pages ──────────────────────────────────────────────────────
import AdminLayout from './components/layout/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import InternshipConfigPage from './pages/admin/InternshipConfigPage';
import SystemReportsPage from './pages/admin/SystemReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import NotificationsCenterPage from './pages/admin/NotificationsCenterPage';
import AdminProfilePage from './pages/admin/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Auth & Landing ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />

          {/* ── Student Routes ── */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/progress" element={<InternshipProgressPage />} />
            <Route path="/grades" element={<GradesEvaluationsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            {/* Redirect old routes to dashboard */}
            <Route path="/internships" element={<Navigate to="/dashboard" replace />} />
            <Route path="/applications" element={<Navigate to="/dashboard" replace />} />
            <Route path="/skills" element={<Navigate to="/profile" replace />} />
            <Route path="/resume" element={<Navigate to="/profile" replace />} />
          </Route>

          {/* ── OJT Head Routes ── */}
          <Route element={<OjtProfessorLayout />}>
            <Route path="/ojt-professor/dashboard" element={<OjtProfessorDashboardPage />} />
            <Route path="/ojt-professor/students" element={<StudentDirectoryPage />} />
            <Route path="/ojt-professor/students/:id" element={<OjtProfessorStudentProfilePage />} />
            <Route path="/ojt-professor/document-review" element={<DocumentReviewPage />} />
            <Route path="/ojt-professor/war-review" element={<WARReviewPage />} />
            <Route path="/ojt-professor/monitoring" element={<ProgressMonitoringPage />} />
            <Route path="/ojt-professor/completion-validation" element={<CompletionValidationPage />} />
            <Route path="/ojt-professor/visit-itinerary" element={<VisitItineraryPage />} />
            <Route path="/ojt-professor/grades" element={<GradeManagementPage />} />
            <Route path="/ojt-professor/reports" element={<ReportsDashboardPage />} />
            <Route path="/ojt-professor/notifications" element={<OjtProfessorNotificationsPage />} />
            <Route path="/ojt-professor/profile" element={<OjtProfessorProfilePage />} />
            {/* Redirect old routes */}
            <Route path="/ojt-professor/applications" element={<Navigate to="/ojt-professor/document-review" replace />} />
            <Route path="/ojt-professor/matching" element={<Navigate to="/ojt-professor/dashboard" replace />} />
            <Route path="/ojt-professor/approvals" element={<Navigate to="/ojt-professor/document-review" replace />} />
            <Route path="/ojt-professor/evaluation" element={<Navigate to="/ojt-professor/completion-validation" replace />} />
          </Route>

          {/* ── Admin Routes ── */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/internship-config" element={<InternshipConfigPage />} />
            <Route path="/admin/reports" element={<SystemReportsPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
            <Route path="/admin/notifications" element={<NotificationsCenterPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            {/* Redirect old routes */}
            <Route path="/admin/verification" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/oversight" element={<Navigate to="/admin/reports" replace />} />
            <Route path="/admin/matching" element={<Navigate to="/admin/internship-config" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
