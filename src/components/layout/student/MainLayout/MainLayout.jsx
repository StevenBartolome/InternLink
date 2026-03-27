import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../Sidebar/Sidebar';
import Topbar from '../../Topbar/Topbar';
import { theme } from '../../../../styles/theme';

const MainLayout = () => {
  const styles = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.colors.bgSecondary,
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '260px', // Matches Student Sidebar width
      minWidth: 0,
    },
    content: {
      flex: 1,
      padding: '16px 24px', // Reduced top padding
    }
  };

  // Handle mobile responsiveness (simplified for layout)
  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    styles.main.marginLeft = '0';
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Topbar />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
