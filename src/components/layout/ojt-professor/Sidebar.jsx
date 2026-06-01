import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users, FileCheck, BarChart2,
  ClipboardCheck, Map, Unlock, BookOpen, Activity, User
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/ojt-professor/dashboard', icon: BarChart2 },
        { label: 'Reports Dashboard', path: '/ojt-professor/reports', icon: BarChart2 },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Student Directory', path: '/ojt-professor/students', icon: Users },
        { label: 'Attendance', path: '/ojt-professor/attendance', icon: ClipboardCheck },
        { label: 'Document Review', path: '/ojt-professor/document-review', icon: FileCheck },
        { label: 'WAR Review', path: '/ojt-professor/war-review', icon: BookOpen },
      ]
    },
    {
      title: 'EVALUATION',
      items: [
        { label: 'Visit Itinerary', path: '/ojt-professor/visit-itinerary', icon: Map },
        { label: 'Grade Management', path: '/ojt-professor/grades', icon: ClipboardCheck },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Profile Settings', path: '/ojt-professor/profile', icon: User },
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
    navItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: '8px',
      textDecoration: 'none',
      color: isActive ? studentDesign.colors.primary : studentDesign.colors.textDark,
      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
      transition: 'all 0.2s ease',
      marginBottom: '2px',
      cursor: 'pointer',
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
    footer: {
      padding: '20px 16px',
      borderTop: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      cursor: 'pointer',
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
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      lineHeight: '1.2',
    },
    userDetails: {
      fontSize: '11px',
      color: studentDesign.colors.textMuted,
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
        <p style={styles.appSubtitle}>OJT Adviser Portal</p>
      </div>

      <nav style={styles.navContainer}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section.title}</h2>
            {section.items.map((item, iIdx) => {
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink 
                  key={iIdx} 
                  to={item.path} 
                  style={styles.navItem(isActive)}
                >
                  <item.icon style={styles.icon(isActive)} />
                  <span style={styles.label}>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <NavLink to="/ojt-professor/profile" style={styles.footer}>
        <div style={styles.avatar}>
          {getInitials(user?.name || (user?.first_name ? user.first_name + ' ' + user.last_name : ''))}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name || (user?.first_name ? user.first_name + ' ' + user.last_name : 'OJT Adviser')}</span>
          <span style={styles.userDetails}>{user?.course_code || 'OJT Adviser'}</span>
        </div>
      </NavLink>
    </aside>
  );
};

export default Sidebar;
