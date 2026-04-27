// src/pages/dean/NotificationsPage.jsx
import React from 'react';
import { Bell, Calendar, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { theme } from '../../styles/theme';
import { deanNotifications } from '../../services/mocks/coordinatorMockData';

const NotificationsPage = () => {
  const styles = {
    container: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' },
    title: { fontSize: '2rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    item: (unread) => ({
      display: 'flex',
      gap: '20px',
      padding: '24px',
      backgroundColor: unread ? '#fff' : '#f8fafc',
      borderRadius: '20px',
      boxShadow: unread ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none',
      border: unread ? `2px solid ${theme.colors.primary}10` : '1px solid #f1f5f9',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
    iconBox: (type) => ({
      width: '52px',
      height: '52px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: type === 'Escalation' ? '#fee2e2' : (type === 'Partnership' ? '#e0f2fe' : '#f1f5f9'),
      color: type === 'Escalation' ? theme.colors.danger : (type === 'Partnership' ? theme.colors.primary : theme.colors.textMuted),
    })
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Escalation': return <AlertTriangle size={24} />;
      case 'Partnership': return <CheckCircle2 size={24} />;
      case 'Program': return <Info size={24} />;
      default: return <Bell size={24} />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={styles.title}>Notifications</h1>
        <button style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: 700, cursor: 'pointer' }}>
          Mark all as read
        </button>
      </div>

      <div style={styles.list}>
        {deanNotifications.map(notif => (
          <div key={notif.id} style={styles.item(notif.unread)}>
            <div style={styles.iconBox(notif.type)}>
              {getIcon(notif.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.colors.textMain }}>{notif.type} Update</span>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted, fontWeight: 600 }}>{notif.time}</span>
              </div>
              <p style={{ margin: 0, color: theme.colors.textMain, fontSize: '0.95rem', lineHeight: 1.5 }}>{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
