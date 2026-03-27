import React, { useState } from 'react';
import { 
  Bell, Mail, CheckCircle2, 
  Clock, AlertCircle, Info,
  MoreVertical, Check, Trash2,
  Briefcase, ShieldAlert
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { userNotifications } from '../../data/mockData';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(userNotifications);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    notificationItem: (read) => ({
      ...commonStyles.dashboardCard,
      display: 'flex',
      gap: '16px',
      padding: '20px',
      backgroundColor: read ? theme.colors.bgPrimary : theme.colors.bgAccent,
      borderLeft: `4px solid ${read ? 'transparent' : theme.colors.primary}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      ':hover': { transform: 'translateX(4px)' }
    }),
    iconWrapper: (type) => {
      const colors = {
        application: { color: theme.colors.primary, bg: '#EBF1FF' },
        system: { color: theme.colors.warning, bg: '#FEF3C7' },
        alert: { color: theme.colors.danger, bg: '#FDE8E8' }
      };
      const c = colors[type] || colors.system;
      return {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: c.color,
        backgroundColor: c.bg,
      };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={{ backgroundColor: theme.colors.danger, color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
              {unreadCount} NEW
            </span>
          )}
        </div>
        <button 
          style={{ background: 'none', border: 'none', color: theme.colors.primary, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
        >
          Mark all as read
        </button>
      </header>

      <div style={styles.notificationList}>
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} style={styles.notificationItem(notif.read)}>
              <div style={styles.iconWrapper(notif.type)}>
                {notif.type === 'application' && <Briefcase size={20} />}
                {notif.type === 'system' && <Info size={20} />}
                {notif.type === 'alert' && <ShieldAlert size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>{notif.type}</span>
                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{notif.timestamp}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: theme.colors.textMain, lineHeight: 1.5, fontWeight: notif.read ? 400 : 600 }}>
                  {notif.message}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  {!notif.read && (
                    <button 
                      style={{ background: 'none', border: 'none', color: theme.colors.primary, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button 
                    style={{ background: 'none', border: 'none', color: theme.colors.danger, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    onClick={() => deleteNotification(notif.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ ...commonStyles.dashboardCard, textAlign: 'center', padding: '60px' }}>
            <Bell size={48} color={theme.colors.border} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: 0, color: theme.colors.textMuted }}>You're all caught up!</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
