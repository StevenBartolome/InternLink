import React, { useState } from 'react';
import { Bell, Search, User, Grid, LogOut } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { coordinatorProfile } from '../../../services/mocks/coordinatorMockData';
import { useNavigate } from 'react-router-dom';
import Modal from '../../common/Modal/Modal';

const Topbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsModalOpen(false);
    localStorage.removeItem('internlink_session');
    navigate('/login');
  };

  const styles = {
    header: {
      height: '70px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '270px',
      zIndex: 900,
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: '#f1f5f9',
      transition: 'all 0.2s ease',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid #fff`,
    }
  };

  return (
    <>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: theme.colors.textMuted }}>
          <Grid size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{coordinatorProfile.school}</span>
        </div>
        <div style={styles.userSection}>
          <div style={{ color: theme.colors.textMuted, cursor: 'pointer' }}>
            <Bell size={20} />
          </div>
          <div style={styles.profile}>
            <img src={coordinatorProfile.avatar} alt="Coordinator" style={styles.avatar} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.colors.textMain }}>{coordinatorProfile.name}</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: theme.colors.danger, 
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              transition: 'all 0.2s',
            }}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
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

export default Topbar;
