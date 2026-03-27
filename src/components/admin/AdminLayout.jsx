import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { theme } from '../../styles/theme';

const AdminLayout = () => {
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
      marginLeft: '260px', // Matches Sidebar width
      minWidth: 0, // Prevent flex items from overflowing
    },
    content: {
      flex: 1,
      padding: '16px 24px', // Reduced top padding
      marginTop: '70px', // Matches Topbar height
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

export default AdminLayout;
