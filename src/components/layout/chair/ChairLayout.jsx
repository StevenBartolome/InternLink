import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from '../../common/Toast';
import { theme } from '../../../styles/theme';

const ChairLayout = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
      marginLeft: '270px',
      minWidth: 0,
    },
    content: {
      flex: 1,
      padding: '24px',
      marginTop: '70px',
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
          <Outlet context={{ showToast }} />
        </main>
      </div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default ChairLayout;
