import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bell, 
  Building2, 
  FileText, 
  Clock, 
  ClipboardList, 
  Briefcase,
  Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { studentDesign } from '../../../styles/StudentDesign';

const StudentSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (user) {
      console.log('Current Student User Data:', {
        id: user.id,
        role: user.role,
        student_id: user.student_id,
        course: user.course
      });
    }
  }, [user]);

  const currentStage = user?.current_stage || 'PRE_INTERNSHIP';
  
  const STAGE_LEVELS = {
    'PRE_INTERNSHIP': 1,
    'DURING_INTERNSHIP': 2,
    'POST_INTERNSHIP': 3,
    'COMPLETED': 4
  };

  const currentLevel = STAGE_LEVELS[currentStage] || 1;

  const getStatus = (itemLevel) => {
    if (currentLevel > itemLevel) return 'Done';
    if (currentLevel === itemLevel) return 'Active';
    return 'Locked';
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, status: 'Active' },
      ]
    },
    {
      title: 'STAGE 1 — PRE-INTERNSHIP',
      level: 1,
      items: [
        { label: 'Company info', path: '/company-info', icon: Building2, status: getStatus(1) },
        { label: 'Documents', path: '/documents', icon: FileText, status: getStatus(1) },
      ]
    },
    {
      title: 'STAGE 2 — DURING INTERNSHIP',
      level: 2,
      items: [
        { label: 'Attendance', path: '/attendance', icon: Clock, status: getStatus(2) },
        { label: 'Weekly reports', path: '/weekly-reports', icon: ClipboardList, status: getStatus(2) },
      ]
    },
    {
      title: 'STAGE 3 — POST-INTERNSHIP',
      level: 3,
      items: [
        { label: 'Portfolio', path: '/portfolio', icon: Briefcase, status: getStatus(3) },
      ]
    }
  ];

  const styles = {
    sidebar: {
      width: '220px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: '#FFFFFF',
      borderRight: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      zIndex: 1000,
    },
    header: {
      padding: '0 24px',
      marginBottom: '32px',
    },
    appName: {
      fontSize: '20px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.primary,
      margin: 0,
      letterSpacing: '-0.5px',
    },
    appSubtitle: {
      fontSize: '11px',
      color: studentDesign.colors.textMuted,
      margin: '4px 0 0 0',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    navContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 12px',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '10px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMuted,
      padding: '0 12px',
      marginBottom: '8px',
      letterSpacing: '0.5px',
    },
    navItem: (isActive, isLocked) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: '8px',
      textDecoration: 'none',
      color: isActive ? studentDesign.colors.primary : (isLocked ? studentDesign.colors.textMuted : studentDesign.colors.textDark),
      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
      transition: 'all 0.2s ease',
      marginBottom: '2px',
      cursor: isLocked ? 'default' : 'pointer',
      position: 'relative',
    }),
    icon: (isActive) => ({
      width: '18px',
      height: '18px',
      marginRight: '12px',
      color: isActive ? studentDesign.colors.primary : 'inherit',
    }),
    label: {
      fontSize: '13px',
      fontWeight: studentDesign.typography.weights.medium,
      flex: 1,
    },
    badge: (type) => ({
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      fontWeight: studentDesign.typography.weights.semibold,
      ...studentDesign.colors.status[type.toLowerCase()],
    }),
    footer: {
      padding: '20px 16px',
      borderTop: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: studentDesign.typography.weights.bold,
      fontSize: '14px',
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    userName: {
      fontSize: '13px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMain,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    userDetails: {
      fontSize: '11px',
      color: studentDesign.colors.textMuted,
    },
    logoutBtn: {
      display: 'none',
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.appName}>InternLink</h1>
        <p style={styles.appSubtitle}>Student Portal</p>
      </div>

      <nav style={styles.navContainer}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section.title}</h2>
            {section.items.map((item, iIdx) => {
              const isActive = location.pathname === item.path;
              const isLocked = item.status === 'Locked';
              
              return (
                <NavLink 
                  key={iIdx} 
                  to={isLocked ? '#' : item.path} 
                  style={styles.navItem(isActive, isLocked)}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <item.icon style={styles.icon(isActive)} />
                  <span style={styles.label}>{item.label}</span>
                  {item.badge && (
                    <span style={{ 
                      backgroundColor: studentDesign.colors.danger, 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '18px', 
                      height: '18px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '10px',
                      marginRight: '8px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                  <span style={styles.badge(item.status)}>{item.status}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={styles.footer}>
        <div style={styles.avatar}>
          {getInitials(user?.first_name + ' ' + user?.last_name)}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.first_name} {user?.last_name}</span>
          <span style={styles.userDetails}>{user?.student_id || 'Student ID'}</span>
          <span style={styles.userDetails}>{user?.course || 'BSIT'}</span>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
