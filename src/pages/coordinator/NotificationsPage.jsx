import React, { useState } from 'react';
import { 
  Bell, Mail, MessageSquare, AlertCircle, 
  CheckCircle, Clock, Trash2, Check,
  Search, Filter
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockNotifications } from '../../data/coordinatorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const NotificationsPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const filteredNotifs = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type.toLowerCase() === filter);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      paddingBottom: '8px',
    },
    notifList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    notifCard: (isRead) => ({
      ...commonStyles.dashboardCard,
      display: 'flex',
      gap: '20px',
      padding: '20px',
      cursor: 'pointer',
      backgroundColor: isRead ? theme.colors.white : 'rgba(59, 130, 246, 0.05)',
      borderLeft: isRead ? `1px solid ${theme.colors.border}` : `4px solid ${theme.colors.primary}`,
      transition: 'all 0.2s ease',
    }),
    iconBox: (type) => {
      const colors = {
        application: { bg: '#E1EFFE', color: '#1E429F' },
        listing: { bg: '#DEF7EC', color: '#03543F' },
        progress: { bg: '#FEF3C7', color: '#92400E' },
        system: { bg: '#F3F4F6', color: '#374151' },
      };
      const color = colors[type.toLowerCase()] || colors.system;
      return {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.bg,
        color: color.color,
        flexShrink: 0,
      };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Notifications</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, fontSize: '0.8rem' }}>
            Mark all as read
          </button>
        </div>
      </div>

      <div style={styles.filterBar}>
        {['All', 'Application', 'Listing', 'Progress', 'System'].map(f => (
          <button 
            key={f} 
            style={{ 
              ...commonStyles.dashboardBtn, 
              backgroundColor: filter === f.toLowerCase() ? theme.colors.primary : theme.colors.bgSecondary,
              color: filter === f.toLowerCase() ? '#fff' : theme.colors.textMuted,
              padding: '8px 16px',
              borderRadius: '20px',
            }}
            onClick={() => setFilter(f.toLowerCase())}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={styles.notifList}>
        {filteredNotifs.map(notif => (
          <div key={notif.id} style={styles.notifCard(notif.read)}>
            <div style={styles.iconBox(notif.type)}>
              {notif.type === 'Application' && <Mail size={22} />}
              {notif.type === 'Listing' && <MessageSquare size={22} />}
              {notif.type === 'Progress' && <Clock size={22} />}
              {notif.type === 'System' && <AlertCircle size={22} />}
              {!['Application', 'Listing', 'Progress', 'System'].includes(notif.type) && <Bell size={22} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: theme.colors.textMain }}>{notif.type}</span>
                <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{notif.timestamp}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textMuted }}>{notif.message}</p>
            </div>
            {!notif.read && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: theme.colors.primary, borderRadius: '50%' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
