// src/components/supervisor/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CheckSquare, 
  FileEdit, 
  GraduationCap 
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navItems = [
    { path: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/supervisor/interns', icon: Users, label: 'My Interns' },
    { path: '/supervisor/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/supervisor/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/supervisor/evaluation', icon: FileEdit, label: 'Evaluation' },
  ];

  const styles = {
    overlay: {
      display: isMobile && isOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 999,
      backdropFilter: 'blur(4px)',
    },
    aside: {
      position: 'fixed',
      top: 0,
      left: isMobile && !isOpen ? '-280px' : 0,
      width: '280px',
      height: '100vh',
      backgroundColor: theme.colors.white,
      borderRight: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    header: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    nav: {
      flex: 1,
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 20px',
      borderRadius: '16px',
      textDecoration: 'none',
      color: isActive ? theme.colors.white : theme.colors.textMuted,
      backgroundColor: isActive ? theme.colors.primary : 'transparent',
      boxShadow: isActive ? theme.shadows.md : 'none',
      transition: 'all 0.2s ease',
    }),
    closeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: theme.colors.textMuted,
      display: isMobile ? 'block' : 'none',
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={toggleSidebar} />
      <aside style={styles.aside}>
        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <GraduationCap size={32} color={theme.colors.primary} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: theme.colors.textMain, margin: 0 }}>InternLink</h3>
          </div>
          {isMobile && (
            <button onClick={toggleSidebar} style={styles.closeBtn}>&times;</button>
          )}
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              style={({ isActive }) => styles.navLink(isActive)}
              onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            >
              <item.icon size={22} />
              <span style={{ fontWeight: 700 }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
