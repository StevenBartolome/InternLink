import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './screens/LandingPage/LandingPage';
import Login from './screens/Login/Login';
import Register from './screens/Register/Register';
import MainLayout from './components/MainLayout';

// Import Pages
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

