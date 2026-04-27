// src/components/supervisor/SupervisorLayout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from '../../common/Toast';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const SupervisorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
    else if (path.includes('/profile')) setPageTitle('My Profile');
  }, [location]);

  const styles = {
    layout: {
      minHeight: '100vh',
      backgroundColor: theme.colors.bgSecondary,
      display: 'flex',
    },
    main: {
      flex: 1,
      marginLeft: isMobile ? 0 : '280px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    content: {
      flex: 1,
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div style={styles.main}>
        <Topbar toggleSidebar={toggleSidebar} title={pageTitle} />
        <main style={styles.content}>
          <Outlet context={{ showToast }} />
        </main>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default SupervisorLayout;
