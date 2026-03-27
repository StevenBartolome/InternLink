// src/pages/employer/NotificationsPage.jsx
import React, { useState } from 'react';
import { Bell, Check, UserPlus, Award, AlertCircle, Circle } from 'lucide-react';
import { notifications as initialNotifications } from '../../data/employerMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const NotificationsPage = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    const iconSize = 18;
    switch(type) {
      case 'Applicant': 
        return { 
          element: <UserPlus size={iconSize} />, 
          bg: '#eff6ff', 
          color: '#2563eb' 
        };
      case 'Evaluation': 
        return { 
          element: <Award size={iconSize} />, 
          bg: '#ecfdf5', 
          color: '#10b981' 
        };
      case 'System': 
        return { 
          element: <AlertCircle size={iconSize} />, 
          bg: '#fff7ed', 
          color: '#f97316' 
        };
      default: 
        return { 
          element: <Bell size={iconSize} />, 
          bg: '#f8fafc', 
          color: theme.colors.textMuted 
        };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    return n.type === activeTab;
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
      gap: '12px',
      flexWrap: 'wrap',
    },
    title: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '14px',
      margin: 0,
    },
    btnLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#f0f9ff',
      }
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      paddingBottom: '4px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    },
    tabBtn: (isActive) => ({
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isActive ? '#eff6ff' : 'transparent',
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }),
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    item: (isRead, isHovered) => ({
      backgroundColor: isHovered ? '#f8fafc' : isRead ? theme.colors.white : '#f0f9ff',
      padding: '16px 20px',
      borderRadius: '20px',
      border: `1px solid ${isRead ? theme.colors.border : '#dbeafe'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      boxShadow: isHovered ? theme.shadows.sm : 'none',
    }),
    iconWrapper: (bg, color) => ({
      width: '40px',
      height: '40px',
      borderRadius: '14px',
      backgroundColor: bg,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    dot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#3b82f6',
      borderRadius: '50%',
      marginRight: '8px',
    },
    emptyState: {
      padding: '100px 20px',
      textAlign: 'center',
      color: theme.colors.textMuted,
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px dashed ${theme.colors.border}`,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.subtitle}>Critical updates regarding your interns and applications.</p>
        </div>
        <button style={styles.btnLink} onClick={handleMarkAllRead}>
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div style={styles.tabs}>
        {['All', 'Unread', 'Applicant', 'Evaluation', 'System'].map(tab => (
          <button 
            key={tab} 
            style={styles.tabBtn(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(n => {
            const iconData = getIcon(n.type);
            const isHovered = hoveredId === n.id;
            
            return (
              <div 
                key={n.id} 
                style={styles.item(n.read, isHovered)}
                onClick={() => handleMarkAsRead(n.id)}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={styles.iconWrapper(iconData.bg, iconData.color)}>
                  {iconData.element}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: n.read ? 600 : 700, color: theme.colors.textMain }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '12px', color: theme.colors.textMuted, fontWeight: 600 }}>
                    {n.timestamp}
                  </span>
                </div>
                {!n.read && <div style={styles.dot}></div>}
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <Bell size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No {activeTab.toLowerCase()} notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
