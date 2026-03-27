import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { adminProfile } from '../../../services/mocks/adminMockData';

const Topbar = () => {
  const styles = {
    header: {
      height: '70px',
      backgroundColor: theme.colors.white,
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      zIndex: 900,
    },
    search: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: theme.colors.bgSecondary,
      padding: '8px 16px',
      borderRadius: '12px',
      width: '320px',
      color: theme.colors.textMuted,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    iconBtn: {
      position: 'relative',
      color: theme.colors.textMuted,
      cursor: 'pointer',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      objectFit: 'cover',
      border: `2px solid ${theme.colors.bgAccent}`,
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.search}>
        <Search size={18} />
        <span style={{ fontSize: '0.875rem' }}>Search system logs, users...</span>
      </div>
      <div style={styles.actions}>
        <div style={styles.iconBtn}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: theme.colors.danger, borderRadius: '50%' }}></span>
        </div>
        <div style={styles.profile}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.colors.textMain }}>{adminProfile.name}</span>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>System Administrator</span>
          </div>
          <img src={adminProfile.avatar} alt="Admin" style={styles.avatar} />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
