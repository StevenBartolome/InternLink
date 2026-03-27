// src/pages/supervisor/DashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Briefcase, FileSignature, ArrowRight } from 'lucide-react';
import { supervisorData, internsData, statsSummary } from '../../data/supervisorMockData';
import StatusBadge from '../../components/supervisor/StatusBadge';
import ProgressBar from '../../components/supervisor/ProgressBar';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const DashboardPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const isSmallMobile = useMediaQuery('(max-width: 768px)');
  const [hoveredShortcut, setHoveredShortcut] = useState(null);
  const [hoveredIntern, setHoveredIntern] = useState(null);

  const statCards = [
    { title: 'Total Assigned Interns', value: statsSummary.totalInterns, icon: Users, color: 'blue' },
    { title: 'Present Today', value: statsSummary.presentToday, icon: CalendarClock, color: 'green' },
    { title: 'Pending Tasks', value: statsSummary.pendingTasks, icon: Briefcase, color: 'amber' },
    { title: 'Evaluations Due', value: statsSummary.evaluationsDue, icon: FileSignature, color: 'purple' },
  ];

  const getIconStyles = (color) => {
    const colors = {
      blue: { bg: '#e0f2fe', text: '#0284c7' },
      green: { bg: '#dcfce7', text: '#16a34a' },
      amber: { bg: '#fef3c7', text: '#d97706' },
      purple: { bg: '#f3e8ff', text: '#7e22ce' },
    };
    return colors[color] || colors.blue;
  };

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    welcomeCard: {
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryHover} 100%)`,
      color: theme.colors.white,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: theme.shadows.md,
      marginBottom: '8px',
    },
    welcomeLabel: {
      fontSize: '14px',
      fontWeight: 600,
      opacity: 0.9,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    welcomeName: {
      fontSize: '28px',
      fontWeight: 800,
      margin: '8px 0',
    },
    subtitle: {
      fontSize: '15px',
      opacity: 0.85,
      margin: 0,
    },
    quote: {
      display: isSmallMobile ? 'none' : 'block',
      fontStyle: 'italic',
      fontSize: '14px',
      opacity: 0.8,
      borderLeft: '3px solid rgba(255,255,255,0.3)',
      paddingLeft: '16px',
      maxWidth: '200px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
    },
    statCard: {
      backgroundColor: theme.colors.white,
      padding: '24px',
      borderRadius: '20px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    statIconWrapper: (bg, text) => ({
      padding: '12px',
      borderRadius: '14px',
      backgroundColor: bg,
      color: text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    statInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    statTitle: {
      fontSize: '13px',
      fontWeight: 600,
      color: theme.colors.textMuted,
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '24px',
    },
    dashboardSection: {
      backgroundColor: theme.colors.white,
      padding: '24px',
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    textBtn: {
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontWeight: 700,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
    },
    internListPreview: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    internPreviewItem: (isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px',
      borderRadius: '16px',
      backgroundColor: isHovered ? '#f8fafc' : 'transparent',
      border: `1px solid ${isHovered ? theme.colors.border : 'transparent'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    internPhotoSm: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      objectFit: 'cover',
    },
    internInfoSm: {
      flex: 1,
    },
    internNameSm: {
      display: 'block',
      fontWeight: 700,
      fontSize: '15px',
      color: theme.colors.textMain,
    },
    internSchoolSm: {
      fontSize: '12px',
      color: theme.colors.textMuted,
    },
    internProgressSm: {
      width: '140px',
      display: isSmallMobile ? 'none' : 'block',
    },
    shortcutsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    shortcutItem: (id) => {
      const isHovered = hoveredShortcut === id;
      return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px',
        backgroundColor: isHovered ? '#f0f9ff' : '#f8fafc',
        border: `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
        borderRadius: '18px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none',
      };
    },
    shortcutLabel: (isHovered) => ({
      fontSize: '13px',
      fontWeight: 700,
      color: isHovered ? theme.colors.primary : theme.colors.textMain,
      textAlign: 'center',
    })
  };

  return (
    <div style={styles.container}>
      {/* Welcome Card */}
      <div style={styles.welcomeCard}>
        <div>
          <span style={styles.welcomeLabel}>Good Day, {supervisorData.name.split(' ')[0]}</span>
          <h1 style={styles.welcomeName}>Supervisor Dashboard</h1>
          <p style={styles.subtitle}>{supervisorData.company} &bull; {supervisorData.department}</p>
        </div>
        <div style={styles.quote}>"Building future talents, one task at a time."</div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const iconData = getIconStyles(stat.color);
          return (
            <div key={index} style={styles.statCard}>
              <div style={styles.statIconWrapper(iconData.bg, iconData.text)}>
                <stat.icon size={24} />
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{stat.value}</span>
                <span style={styles.statTitle}>{stat.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div style={styles.dashboardGrid}>
        {/* Intern List Preview */}
        <div style={styles.dashboardSection}>
          <div style={styles.sectionHeader}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Assigned Interns</h3>
            <button style={styles.textBtn} onClick={() => navigate('/supervisor/interns')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.internListPreview}>
            {internsData.map((intern) => (
              <div 
                key={intern.id} 
                style={styles.internPreviewItem(hoveredIntern === intern.id)} 
                onMouseEnter={() => setHoveredIntern(intern.id)}
                onMouseLeave={() => setHoveredIntern(null)}
                onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
              >
                <img src={intern.photo} alt={intern.name} style={styles.internPhotoSm} />
                <div style={styles.internInfoSm}>
                  <span style={styles.internNameSm}>{intern.name}</span>
                  <span style={styles.internSchoolSm}>{intern.school}</span>
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <StatusBadge status={intern.todayStatus} />
                </div>
                <div style={styles.internProgressSm}>
                  <ProgressBar rendered={intern.renderedHours} required={intern.requiredHours} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.dashboardSection}>
          <div style={styles.sectionHeader}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={styles.shortcutsGrid}>
            <button 
              style={styles.shortcutItem('attendance')} 
              onMouseEnter={() => setHoveredShortcut('attendance')}
              onMouseLeave={() => setHoveredShortcut(null)}
              onClick={() => navigate('/supervisor/attendance')}
            >
              <CalendarClock size={28} style={{ color: theme.colors.primary }} />
              <span style={styles.shortcutLabel(hoveredShortcut === 'attendance')}>Log Attendance</span>
            </button>
            <button 
              style={styles.shortcutItem('tasks')} 
              onMouseEnter={() => setHoveredShortcut('tasks')}
              onMouseLeave={() => setHoveredShortcut(null)}
              onClick={() => navigate('/supervisor/tasks')}
            >
              <Briefcase size={28} style={{ color: theme.colors.primary }} />
              <span style={styles.shortcutLabel(hoveredShortcut === 'tasks')}>Manage Tasks</span>
            </button>
            <button 
              style={styles.shortcutItem('evaluation')} 
              onMouseEnter={() => setHoveredShortcut('evaluation')}
              onMouseLeave={() => setHoveredShortcut(null)}
              onClick={() => navigate('/supervisor/evaluation')}
            >
              <FileSignature size={28} style={{ color: theme.colors.primary }} />
              <span style={styles.shortcutLabel(hoveredShortcut === 'evaluation')}>Evaluate Intern</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
