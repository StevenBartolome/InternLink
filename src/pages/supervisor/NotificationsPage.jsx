// src/pages/supervisor/NotificationsPage.jsx
import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, LogIn, FileText, Users, Check } from 'lucide-react';
import { notificationsData } from '../../services/mocks/supervisorMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const NotificationsPage = () => {
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(notificationsData);

  const getIcon = (notif) => {
    const size = 20;
    switch (notif.icon) {
      case 'log-in': return <LogIn size={size} color={theme.colors.primary} />;
      case 'check-circle': return <CheckCircle2 size={size} color={theme.colors.success} />;
      case 'alert-circle': return <AlertCircle size={size} color={theme.colors.danger} />;
      case 'file-text': return <FileText size={size} color="#8b5cf6" />; // Purple
      case 'users': return <Users size={size} color="#3b82f6" />; // Blue
      default: return <Bell size={size} color={theme.colors.textMuted} />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleReadClick = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return !n.read;
  });

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: theme.colors.textMuted,
      margin: '4px 0 0 0',
    },
    markReadBtn: {
      ...commonStyles.buttonSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      padding: '10px 16px',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: '24px',
    },
    tabsBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      borderBottom: `1px solid ${theme.colors.border}`,
      paddingBottom: '16px',
    },
    tabItem: (isActive) => ({
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      backgroundColor: isActive ? '#eff6ff' : 'transparent',
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      border: 'none',
      transition: 'all 0.2s',
    }),
    notifList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    notifItem: (isRead) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '18px',
      borderRadius: '20px',
      backgroundColor: isRead ? 'transparent' : '#f8fafc',
      border: `1px solid ${isRead ? 'transparent' : theme.colors.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': { backgroundColor: '#f1f5f9' }
    }),
    iconBox: {
      width: '44px',
      height: '44px',
      borderRadius: '14px',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifMessage: {
      fontSize: '14px',
      fontWeight: 600,
      color: theme.colors.textMain,
      margin: 0,
    },
    notifTime: {
      fontSize: '12px',
      color: theme.colors.textMuted,
      marginTop: '4px',
      display: 'block',
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme.colors.primary,
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 24px',
      color: theme.colors.textMuted,
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Notifications</h2>
            <p style={styles.subtitle}>Stay updated with your interns' activities</p>
          </div>
          <button style={styles.markReadBtn} onClick={markAllAsRead}>
            <Check size={18} /> Mark all as read
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.tabsBar}>
            <button 
              style={styles.tabItem(activeTab === 'All')}
              onClick={() => setActiveTab('All')}
            >
              All Notifications
            </button>
            <button 
              style={styles.tabItem(activeTab === 'Unread')}
              onClick={() => setActiveTab('Unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>

          <div style={styles.notifList}>
            {filteredNotifications.length === 0 ? (
              <div style={styles.emptyState}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No new notifications at the moment.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  style={styles.notifItem(notif.read)}
                  onClick={() => handleReadClick(notif.id)}
                >
                  <div style={styles.iconBox}>
                    {getIcon(notif)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.notifMessage}>{notif.message}</p>
                    <span style={styles.notifTime}>{notif.timestamp}</span>
                  </div>
                  {!notif.read && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
