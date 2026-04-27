import React from 'react';
import { theme } from '../../styles/theme';

const NotificationsPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 24px 0' }}>Notifications</h1>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <p style={{ color: theme.colors.textMuted }}>No new notifications at this time.</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
