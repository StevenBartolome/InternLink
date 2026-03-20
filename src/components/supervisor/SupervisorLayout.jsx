// src/components/supervisor/SupervisorLayout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/supervisor/global.css'; // Import global styles for supervisor
import '../../assets/css/supervisor/SupervisorLayout.css';

const SupervisorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) setPageTitle('Dashboard');
    else if (path.includes('/interns')) setPageTitle('My Interns');
    else if (path.includes('/attendance')) setPageTitle('Attendance Log');
    else if (path.includes('/tasks')) setPageTitle('Task Management');
    else if (path.includes('/evaluation')) setPageTitle('Evaluation');
    else if (path.includes('/notifications')) setPageTitle('Notifications');
  }, [location]);

  return (
    <div className="supervisor-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
      )}

      <div className="layout-main">
        <Topbar toggleSidebar={toggleSidebar} title={pageTitle} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;
