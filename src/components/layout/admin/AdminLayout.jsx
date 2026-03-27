import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const AdminLayout = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');

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
      marginLeft: isMobile ? '0' : '260px',
      minWidth: 0,
    },
    content: {
      flex: 1,
      padding: '16px 24px',
      marginTop: '70px',
    }
  };

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
