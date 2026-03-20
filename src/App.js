import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './screens/LandingPage/LandingPage';
import Login from './screens/Login/Login';
import Register from './screens/Register/Register';
import MainLayout from './components/MainLayout/MainLayout';

// Import Student Pages
import ProfilePage from './pages/ProfilePage';
import SkillsManagerPage from './pages/SkillsManagerPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import InternshipBrowsePage from './pages/InternshipBrowsePage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import InternshipProgressPage from './pages/InternshipProgressPage';
import GradesEvaluationsPage from './pages/GradesEvaluationsPage';
import NotificationsPage from './pages/NotificationsPage';
import DashboardPage from './pages/DashboardPage';

// Import Employer Pages
import EmployerDashboardPage from './pages/employer/DashboardPage/DashboardPage';
import CompanyProfilePage from './pages/employer/CompanyProfilePage/CompanyProfilePage';
import PostInternshipPage from './pages/employer/PostInternshipPage/PostInternshipPage';
import ManageListingsPage from './pages/employer/ManageListingsPage/ManageListingsPage';
import ApplicantReviewPage from './pages/employer/ApplicantReviewPage/ApplicantReviewPage';
import ApplicationApprovalPage from './pages/employer/ApplicationApprovalPage/ApplicationApprovalPage';
import InternProgressTrackerPage from './pages/employer/InternProgressTrackerPage/InternProgressTrackerPage';
import AssignSupervisorPage from './pages/employer/AssignSupervisorPage/AssignSupervisorPage';
import EmployerNotificationsPage from './pages/employer/NotificationsPage/NotificationsPage';
import ManageSupervisorsPage from './pages/employer/ManageSupervisorsPage/ManageSupervisorsPage';
// Import Supervisor Pages
import SupervisorLayout from './components/supervisor/SupervisorLayout';
import SupervisorDashboardPage from './pages/supervisor/DashboardPage/DashboardPage';
import MyInternsPage from './pages/supervisor/MyInternsPage/MyInternsPage';
import InternDetailPage from './pages/supervisor/InternDetailPage/InternDetailPage';
import AttendanceLogPage from './pages/supervisor/AttendanceLogPage/AttendanceLogPage';
import TaskManagementPage from './pages/supervisor/TaskManagementPage/TaskManagementPage';
import EvaluationPage from './pages/supervisor/EvaluationPage/EvaluationPage';
import SupervisorNotificationsPage from './pages/supervisor/NotificationsPage/NotificationsPage';
import SupervisorProfilePage from './pages/supervisor/ProfilePage/ProfilePage';

// Import Coordinator Pages
import CoordinatorLayout from './components/coordinator/CoordinatorLayout';
import CoordinatorDashboardPage from './pages/coordinator/DashboardPage/DashboardPage';
import StudentDirectoryPage from './pages/coordinator/StudentDirectoryPage/StudentDirectoryPage';
import ApplicationTrackingPage from './pages/coordinator/ApplicationTrackingPage/ApplicationTrackingPage';
import InternshipApprovalPage from './pages/coordinator/InternshipApprovalPage/InternshipApprovalPage';
import ProgressMonitoringPage from './pages/coordinator/ProgressMonitoringPage/ProgressMonitoringPage';
import GradeManagementPage from './pages/coordinator/GradeManagementPage/GradeManagementPage';
import AutomatedMatchingPage from './pages/coordinator/AutomatedMatchingPage/AutomatedMatchingPage';
import StudentEvaluationPage from './pages/coordinator/StudentEvaluationPage/StudentEvaluationPage';
import ReportsDashboardPage from './pages/coordinator/ReportsDashboardPage/ReportsDashboardPage';
import CoordinatorNotificationsPage from './pages/coordinator/NotificationsPage/NotificationsPage';
import CoordinatorProfilePage from './pages/coordinator/ProfilePage/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth & Landing Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
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
          <Route path="/coordinator/progress" element={<ProgressMonitoringPage />} />
          <Route path="/coordinator/grades" element={<GradeManagementPage />} />
          <Route path="/coordinator/matching" element={<AutomatedMatchingPage />} />
          <Route path="/coordinator/evaluation" element={<StudentEvaluationPage />} />
          <Route path="/coordinator/reports" element={<ReportsDashboardPage />} />
          <Route path="/coordinator/notifications" element={<CoordinatorNotificationsPage />} />
          <Route path="/coordinator/profile" element={<CoordinatorProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
