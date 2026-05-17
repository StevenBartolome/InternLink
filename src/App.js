import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/auth/LandingPage/LandingPage';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import SetupAccount from './pages/auth/SetupAccount/SetupAccount';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/common/LoadingScreen';

// ── Student Pages ────────────────────────────────────────────────────
import StudentLayout from './components/layout/student/StudentLayout';
import Dashboard from './pages/students/redesign/Dashboard';
import Documents from './pages/students/redesign/Documents';
import Templates from './pages/students/redesign/Templates';
import Attendance from './pages/students/redesign/Attendance';
import WeeklyReports from './pages/students/redesign/WeeklyReports';
import CompanyInfo from './pages/students/redesign/CompanyInfo';
import Portfolio from './pages/students/redesign/Portfolio';
import Notifications from './pages/students/redesign/Notifications';
import ProfilePage from './pages/students/ProfilePage';

// ── OJT Adviser Pages ───────────────────────────────────────────────────
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
import DepartmentProgramPage from './pages/admin/DepartmentProgramPage';

// ── Security Components ───────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access wrong role page
    const fallback = user.role === 'admin' ? '/admin/dashboard' : user.role === 'ojt_head' ? '/ojt-professor/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // FORCE PASSWORD CHANGE ON FIRST LOGIN (Students Only)
  if (user.role === 'student' && user.is_first_login && window.location.pathname !== '/setup-account') {
    console.log('[Auth] Redirecting student to setup-account:', {
      userId: user.id,
      email: user.email,
      is_first_login: user.is_first_login,
      currentPath: window.location.pathname
    });
    return <Navigate to="/setup-account" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (user) {
    const fallback = user.role === 'admin' ? '/admin/dashboard' : user.role === 'ojt_head' ? '/ojt-professor/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <style>{`
        input:focus, textarea:focus, select:focus {
          border-color: #1E40AF !important;
          box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.12) !important;
          outline: none !important;
          background-color: #ffffff !important;
        }
        input, textarea, select {
          transition: all 0.2s ease-in-out !important;
        }
      `}</style>
      <BrowserRouter>
        <Routes>
          {/* ── Auth & Landing ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/setup-account" element={<SetupAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* ── Student Routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/company-info" element={<CompanyInfo />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/weekly-reports" element={<WeeklyReports />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Redirect old routes to new ones */}
            <Route path="/progress" element={<Navigate to="/dashboard" replace />} />
            <Route path="/grades" element={<Navigate to="/dashboard" replace />} />
            <Route path="/internships" element={<Navigate to="/dashboard" replace />} />
            <Route path="/applications" element={<Navigate to="/dashboard" replace />} />
            <Route path="/skills" element={<Navigate to="/profile" replace />} />
            <Route path="/resume" element={<Navigate to="/profile" replace />} />
          </Route>

          {/* ── OJT Adviser Routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['ojt_head']}><OjtProfessorLayout /></ProtectedRoute>}>
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
          <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/internship-config" element={<InternshipConfigPage />} />
            <Route path="/admin/reports" element={<SystemReportsPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
            <Route path="/admin/notifications" element={<NotificationsCenterPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/departments" element={<DepartmentProgramPage />} />
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
