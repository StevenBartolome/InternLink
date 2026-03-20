import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/coordinator-global.css';
import '../../assets/css/coordinator/CoordinatorLayout.css';

const CoordinatorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Add coordinator theme class to body
    document.body.classList.add('coordinator-theme');
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('coordinator-theme');
    };
  }, []);

  // Map pathname to Page Title
  const getPageTitle = (pathname) => {
    if (pathname.includes('dashboard')) return 'Dashboard Overview';
    if (pathname.includes('students')) return 'Student Directory';
    if (pathname.includes('applications')) return 'Application Tracking';
    if (pathname.includes('approvals')) return 'Internship Approvals';
    if (pathname.includes('progress')) return 'Progress Monitoring';
    if (pathname.includes('grades')) return 'Grade Management';
    if (pathname.includes('matching')) return 'Automated Matching';
    if (pathname.includes('evaluation')) return 'Student Evaluation';
    if (pathname.includes('reports')) return 'Reports Dashboard';
    if (pathname.includes('notifications')) return 'Notifications';
    return 'Coordinator Dashboard';
  };

  return (
    <div className="coordinator-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="coordinator-main-wrapper">
        <Topbar 
          title={getPageTitle(location.pathname)} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="coordinator-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoordinatorLayout;
