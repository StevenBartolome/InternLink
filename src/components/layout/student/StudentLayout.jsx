import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';
import { studentDesign } from '../../../styles/StudentDesign';
import BullBot from '../../common/BullBot';

const StudentLayout = () => {
  const styles = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: studentDesign.typography.fontFamily,
    },
    main: {
      flex: 1,
      marginLeft: '220px', // Sidebar width
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    content: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
    }
  };

  return (
    <div style={styles.layout}>
      <StudentSidebar />
      <div style={styles.main}>
        <StudentTopbar />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
      <BullBot />
    </div>
  );
};

export default StudentLayout;
