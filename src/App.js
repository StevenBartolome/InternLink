import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/auth/LandingPage/LandingPage';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import MainLayout from './components/layout/student/MainLayout/MainLayout';

// Import Student Pages
import ProfilePage from './pages/students/ProfilePage';
import SkillsManagerPage from './pages/students/SkillsManagerPage';
import ResumeUploadPage from './pages/students/ResumeUploadPage';
import InternshipBrowsePage from './pages/students/InternshipBrowsePage';
import InternshipDetailPage from './pages/students/InternshipDetailPage';
import ApplicationFormPage from './pages/students/ApplicationFormPage';
import MyApplicationsPage from './pages/students/MyApplicationsPage';
import InternshipProgressPage from './pages/students/InternshipProgressPage';
import GradesEvaluationsPage from './pages/students/GradesEvaluationsPage';
import NotificationsPage from './pages/students/NotificationsPage';
import DashboardPage from './pages/students/DashboardPage';

// Import Employer Pages
import EmployerDashboardPage from './pages/employer/DashboardPage';
import CompanyProfilePage from './pages/employer/CompanyProfilePage';
import PostInternshipPage from './pages/employer/PostInternshipPage';
import ManageListingsPage from './pages/employer/ManageListingsPage';
import ApplicantReviewPage from './pages/employer/ApplicantReviewPage';
import ApplicationApprovalPage from './pages/employer/ApplicationApprovalPage';
import InternProgressTrackerPage from './pages/employer/InternProgressTrackerPage';
import AssignSupervisorPage from './pages/employer/AssignSupervisorPage';
import EmployerNotificationsPage from './pages/employer/NotificationsPage';
import ManageSupervisorsPage from './pages/employer/ManageSupervisorsPage';

// Import Supervisor Pages
import SupervisorLayout from './components/layout/supervisor/SupervisorLayout';
import SupervisorDashboardPage from './pages/supervisor/DashboardPage';
import MyInternsPage from './pages/supervisor/MyInternsPage';
import InternDetailPage from './pages/supervisor/InternDetailPage';
import AttendanceLogPage from './pages/supervisor/AttendanceLogPage';
import TaskManagementPage from './pages/supervisor/TaskManagementPage';
import EvaluationPage from './pages/supervisor/EvaluationPage';
import SupervisorNotificationsPage from './pages/supervisor/NotificationsPage';
import SupervisorProfilePage from './pages/supervisor/ProfilePage';

// Import Coordinator Pages
import CoordinatorLayout from './components/layout/coordinator/CoordinatorLayout';
import CoordinatorDashboardPage from './pages/coordinator/DashboardPage';
import StudentDirectoryPage from './pages/coordinator/StudentDirectoryPage';
import ApplicationTrackingPage from './pages/coordinator/ApplicationTrackingPage';
import InternshipApprovalPage from './pages/coordinator/InternshipApprovalPage';
import ProgressMonitoringPage from './pages/coordinator/ProgressMonitoringPage';
import GradeManagementPage from './pages/coordinator/GradeManagementPage';
import AutomatedMatchingPage from './pages/coordinator/AutomatedMatchingPage';
import StudentEvaluationPage from './pages/coordinator/StudentEvaluationPage';
import ReportsDashboardPage from './pages/coordinator/ReportsDashboardPage';
import CoordinatorNotificationsPage from './pages/coordinator/NotificationsPage';
import CoordinatorProfilePage from './pages/coordinator/ProfilePage';
import CoordinatorStudentProfilePage from './pages/coordinator/StudentProfilePage';

// Import Admin Pages
import AdminLayout from './components/layout/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AccountVerificationPage from './pages/admin/AccountVerificationPage';
import InternshipOversightPage from './pages/admin/InternshipOversightPage';
import MatchingEngineSettingsPage from './pages/admin/MatchingEngineSettingsPage';
import SystemReportsPage from './pages/admin/SystemReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import NotificationsCenterPage from './pages/admin/NotificationsCenterPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminProfilePage from './pages/admin/ProfilePage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth & Landing Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />

        {/* Protected/Authenticated Dashboard Layout */}
        <Route element={<MainLayout />}>
          {/* Student Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/skills" element={<SkillsManagerPage />} />
          <Route path="/resume" element={<ResumeUploadPage />} />
          <Route path="/internships" element={<InternshipBrowsePage />} />
          <Route path="/internships/:id" element={<InternshipDetailPage />} />
          <Route path="/apply/:id" element={<ApplicationFormPage />} />
          <Route path="/applications" element={<MyApplicationsPage />} />
          <Route path="/progress" element={<InternshipProgressPage />} />
          <Route path="/grades" element={<GradesEvaluationsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Employer Routes */}
          <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
          <Route path="/employer/profile" element={<CompanyProfilePage />} />
          <Route path="/employer/post" element={<PostInternshipPage />} />
          <Route path="/employer/listings" element={<ManageListingsPage />} />
          <Route path="/employer/applicants" element={<ApplicantReviewPage />} />
          <Route path="/employer/approvals" element={<ApplicationApprovalPage />} />
          <Route path="/employer/progress" element={<InternProgressTrackerPage />} />
          <Route path="/employer/assign-supervisor" element={<AssignSupervisorPage />} />
          <Route path="/employer/supervisors" element={<ManageSupervisorsPage />} />
          <Route path="/employer/notifications" element={<EmployerNotificationsPage />} />
        </Route>

        {/* Supervisor Routes */}
        <Route element={<SupervisorLayout />}>
          <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
          <Route path="/supervisor/interns" element={<MyInternsPage />} />
          <Route path="/supervisor/interns/:id" element={<InternDetailPage />} />
          <Route path="/supervisor/attendance" element={<AttendanceLogPage />} />
          <Route path="/supervisor/tasks" element={<TaskManagementPage />} />
          <Route path="/supervisor/evaluation" element={<EvaluationPage />} />
          <Route path="/supervisor/notifications" element={<SupervisorNotificationsPage />} />
          <Route path="/supervisor/profile" element={<SupervisorProfilePage />} />
        </Route>

        {/* Coordinator Routes */}
        <Route element={<CoordinatorLayout />}>
          <Route path="/coordinator/dashboard" element={<CoordinatorDashboardPage />} />
          <Route path="/coordinator/students" element={<StudentDirectoryPage />} />
          <Route path="/coordinator/applications" element={<ApplicationTrackingPage />} />
          <Route path="/coordinator/approvals" element={<InternshipApprovalPage />} />
          <Route path="/coordinator/monitoring" element={<ProgressMonitoringPage />} />
          <Route path="/coordinator/grades" element={<GradeManagementPage />} />
          <Route path="/coordinator/matching" element={<AutomatedMatchingPage />} />
          <Route path="/coordinator/evaluation" element={<StudentEvaluationPage />} />
          <Route path="/coordinator/reports" element={<ReportsDashboardPage />} />
          <Route path="/coordinator/notifications" element={<CoordinatorNotificationsPage />} />
          <Route path="/coordinator/profile" element={<CoordinatorProfilePage />} />
          <Route path="/coordinator/students/:id" element={<CoordinatorStudentProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/verification" element={<AccountVerificationPage />} />
          <Route path="/admin/oversight" element={<InternshipOversightPage />} />
          <Route path="/admin/matching" element={<MatchingEngineSettingsPage />} />
          <Route path="/admin/reports" element={<SystemReportsPage />} />
          <Route path="/admin/audit" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<SystemSettingsPage />} />
          <Route path="/admin/notifications" element={<NotificationsCenterPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
