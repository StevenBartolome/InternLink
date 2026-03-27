// src/components/supervisor/Topbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { supervisorData, notificationsData } from '../../data/supervisorMockData';
import Modal from '../Modal/Modal';
import { theme } from '../../styles/theme';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Topbar = ({ toggleSidebar, title }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  const unreadCount = notificationsData.filter(n => !n.read).length;

  const styles = {
    header: {
      height: '70px',
      backgroundColor: theme.colors.white,
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    menuBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.textMain,
      cursor: 'pointer',
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '20px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    iconBtn: {
      backgroundColor: theme.colors.bgSecondary,
      border: `1px solid ${theme.colors.border}`,
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.textMain,
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s',
    },
    badge: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme.colors.danger,
      border: `2px solid ${theme.colors.white}`,
    },
    divider: {
      width: '1px',
      height: '24px',
      backgroundColor: theme.colors.border,
      margin: '0 4px',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '6px 12px',
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    avatar: {
      width: '38px',
      height: '38px',
      borderRadius: '10px',
      objectFit: 'cover',
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    userName: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    userRole: {
      fontSize: '11px',
      fontWeight: 600,
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    logoutBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.danger,
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      transition: 'all 0.2s',
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button style={styles.menuBtn} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 style={styles.title}>{title}</h1>
      </div>

      <div style={styles.right}>
        <button 
          style={styles.iconBtn} 
          onClick={() => navigate('/supervisor/notifications')}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span style={styles.badge} />}
        </button>
        
        {!isMobile && <div style={styles.divider} />}
        
        {!isMobile && (
          <div 
            style={styles.profile} 
            onClick={() => navigate('/supervisor/profile')}
          >
            <img 
              src={supervisorData.avatar} 
              alt={supervisorData.name} 
              style={styles.avatar} 
            />
            <div style={styles.userInfo}>
              <div style={styles.userName}>{supervisorData.name}</div>
              <div style={styles.userRole}>{supervisorData.role}</div>
            </div>
          </div>
        )}

        <button 
          style={styles.logoutBtn} 
          onClick={() => setIsModalOpen(true)}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isConfirm={true}
        onConfirm={handleLogout}
        title="Confirm Logout" 
        message="Are you sure you want to sign out of InternLink?" 
        type="warning" 
      />
    </header>
  );
};

export default Topbar;
