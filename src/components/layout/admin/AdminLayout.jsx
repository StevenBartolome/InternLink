import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { studentDesign } from '../../../styles/StudentDesign';
import BullBot from '../../common/BullBot';

const AdminLayout = () => {
  const styles = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: studentDesign.typography.fontFamily,
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '220px', // Matches Sidebar width
      minWidth: 0,
    },
    content: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
    }
  };

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
      <BullBot />
    </div>
  );
};

export default AdminLayout;
