import React, { useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { studentDesign } from '../../../styles/StudentDesign';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '../../common/Modal/Modal';

const StudentTopbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsModalOpen(false);
    await logout();
    window.location.replace('/login');
  };

  // Map path to title
  const getPageTitle = (path) => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/notifications': 'Notifications',
      '/company-info': 'Company Information',
      '/documents': 'Documents',
      '/attendance': 'Attendance',
      '/weekly-reports': 'Weekly Activity Reports',
      '/portfolio': 'Portfolio'
    };
    return titles[path] || 'Dashboard';
  };

  const styles = {
    topbar: {
      height: '64px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
    },
    title: {
      fontSize: '20px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMain,
      margin: 0,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconButton: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: studentDesign.colors.textMuted,
      transition: 'all 0.2s ease',
      border: 'none',
      backgroundColor: 'transparent',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: studentDesign.colors.primaryLight,
      color: studentDesign.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      marginLeft: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
    },
    logoutBtn: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: studentDesign.colors.textMuted,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      backgroundColor: 'transparent',
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <header style={styles.topbar}>
        <h2 style={styles.title}>{getPageTitle(location.pathname)}</h2>
        
        <div style={styles.actions}>
          <button style={styles.iconButton}>
            <Search size={20} />
          </button>
          <motion.button 
            whileHover={{ backgroundColor: '#F1F5F9' }}
            style={styles.iconButton}
            onClick={() => navigate('/notifications')}
          >
            <Bell size={20} />
          </motion.button>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            style={styles.avatar}
            onClick={() => navigate('/profile')}
          >
            {getInitials(user?.first_name + ' ' + user?.last_name)}
          </motion.div>
          <div style={{ width: '1px', height: '24px', backgroundColor: studentDesign.colors.border, margin: '0 8px' }} />
          <motion.button 
            whileHover={{ backgroundColor: '#FEE2E2', color: studentDesign.colors.danger }}
            style={styles.logoutBtn}
            onClick={() => setIsModalOpen(true)}
            title="Logout"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isConfirm={true}
        onConfirm={handleLogout}
        title="Confirm Logout" 
        message="Are you sure you want to sign out of InternLink?" 
        type="warning" 
      />
    </>
  );
};

export default StudentTopbar;
