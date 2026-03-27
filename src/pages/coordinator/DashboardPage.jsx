import React, { useState } from 'react';
import { Users, FileCheck, AlertCircle, FileText, ArrowRight, Activity, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/coordinator/StatCard';
import { coordinatorProfile, mockNotifications, mockStudents, mockEmployerListings } from '../../data/coordinatorMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const DashboardPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredFeedItem, setHoveredFeedItem] = useState(null);
  const [hoveredShortcut, setHoveredShortcut] = useState(null);

  const stats = [
    { title: "Total Students", value: mockStudents.length, icon: Users, color: "primary" },
    { title: "Active Placements", value: mockStudents.filter(s => s.status === 'Placed').length, icon: FileCheck, color: "success" },
    { title: "Pending Approvals", value: mockEmployerListings.filter(l => l.status === 'Pending').length, icon: AlertCircle, color: "warning" },
    { title: "Evaluations Due", value: 4, icon: FileText, color: "info" }
  ];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    welcomeBanner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: theme.colors.white,
      padding: '2.25rem 2rem',
      borderRadius: '16px',
      boxShadow: theme.shadows.md,
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
      alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
      gap: window.innerWidth <= 768 ? '1rem' : '0',
    },
    welcomeText: {
      h2: {
        fontSize: '1.625rem',
        fontWeight: 700,
        color: theme.colors.white,
        marginBottom: '0.5rem',
      },
      p: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.875rem',
      }
    },
    quickActions: {
      display: 'flex',
      gap: '1rem',
    },
    dashboardBtn: (type, isHovered) => ({
      ...commonStyles.dashboardBtn,
      padding: '0.625rem 1.25rem',
      borderRadius: '30px',
      fontSize: '0.875rem',
      fontWeight: '600',
      backgroundColor: type === 'primary' 
        ? (isHovered ? 'rgba(255, 255, 255, 0.9)' : '#ffffff')
        : (isHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)'),
      color: type === 'primary' ? '#1e40af' : '#ffffff',
      border: type === 'primary' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: type === 'secondary' ? 'blur(4px)' : 'none',
      transform: isHovered ? 'translateY(-1px)' : 'none',
    }),
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '1.5rem',
      alignItems: 'start',
    },
    card: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      h3: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: theme.colors.textMain,
      }
    },
    btnLink: (isHovered) => ({
      background: 'none',
      border: 'none',
      color: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      fontWeight: 500,
      fontSize: '0.875rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: theme.transitions.default,
    }),
    feedList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    feedItem: (isHovered, isRead) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '0.75rem',
      borderRadius: '8px',
      transition: theme.transitions.default,
      position: 'relative',
      backgroundColor: isHovered ? theme.colors.bgSecondary : 'transparent',
    }),
    feedIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    feedContent: {
      flex: 1,
    },
    feedMessage: {
      fontSize: '0.875rem',
      color: theme.colors.textMain,
      marginBottom: '0.25rem',
    },
    feedTime: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      backgroundColor: theme.colors.danger,
      borderRadius: '50%',
      position: 'absolute',
      top: '12px',
      right: '12px',
    },
    shortcutsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    shortcutItem: (isHovered) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '1.5rem',
      backgroundColor: isHovered ? theme.colors.bgAccent : theme.colors.bgPrimary,
      border: `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: theme.transitions.default,
      color: isHovered ? theme.colors.primary : theme.colors.textMain,
      transform: isHovered ? 'translateY(-2px)' : 'none',
      span: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textAlign: 'center',
      }
    })
  };

  return (
    <div style={styles.container}>
      {/* Welcome Card */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeText}>
          <h2 style={styles.welcomeText.h2}>Welcome back, {coordinatorProfile.name}!</h2>
          <p style={styles.welcomeText.p}>{coordinatorProfile.school} • {coordinatorProfile.department}</p>
        </div>
        <div style={styles.quickActions}>
          <button 
            style={styles.dashboardBtn('primary', hoveredBtn === 'review')} 
            onMouseEnter={() => setHoveredBtn('review')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/coordinator/approvals')}
          >
            Review Listings
          </button>
          <button 
            style={styles.dashboardBtn('secondary', hoveredBtn === 'report')} 
            onMouseEnter={() => setHoveredBtn('report')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/coordinator/reports')}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div style={styles.dashboardGrid}>
        {/* Recent Activity */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Recent Activity</h3>
            <button 
              style={styles.btnLink(hoveredBtn === 'viewAll')}
              onMouseEnter={() => setHoveredBtn('viewAll')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.feedList}>
            {mockNotifications.map((notif) => (
              <div 
                key={notif.id} 
                style={styles.feedItem(hoveredFeedItem === notif.id, notif.read)}
                onMouseEnter={() => setHoveredFeedItem(notif.id)}
                onMouseLeave={() => setHoveredFeedItem(null)}
              >
                <div style={styles.feedIcon}>
                  {notif.type === 'Application' && <FileText size={16} />}
                  {notif.type === 'Listing' && <AlertCircle size={16} />}
                  {notif.type === 'Progress' && <Activity size={16} />}
                  {!['Application', 'Listing', 'Progress'].includes(notif.type) && <AlertCircle size={16} />}
                </div>
                <div style={styles.feedContent}>
                  <p style={styles.feedMessage}>{notif.message}</p>
                  <span style={styles.feedTime}>{notif.timestamp}</span>
                </div>
                {!notif.read && <span style={styles.unreadDot}></span>}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Quick Actions</h3>
          </div>
          <div style={styles.shortcutsGrid}>
            {[
              { label: 'View Students', icon: Users, path: '/coordinator/students', id: 'students' },
              { label: 'Approve Listings', icon: FileCheck, path: '/coordinator/approvals', id: 'approvals' },
              { label: 'Track Applications', icon: FileText, path: '/coordinator/applications', id: 'apps' },
              { label: 'View Reports', icon: BarChart2, path: '/coordinator/reports', id: 'reports' }
            ].map((item) => (
              <button 
                key={item.id}
                style={styles.shortcutItem(hoveredShortcut === item.id)} 
                onMouseEnter={() => setHoveredShortcut(item.id)}
                onMouseLeave={() => setHoveredShortcut(null)}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={24} />
                <span style={styles.shortcutItem().span}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
