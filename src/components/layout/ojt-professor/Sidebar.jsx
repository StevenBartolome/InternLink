import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users, FileCheck, BarChart2,
  LogOut, GraduationCap,
  ClipboardCheck, Map, Unlock, BookOpen, Activity, User
} from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/ojt-professor/dashboard', icon: BarChart2 },
    { name: 'Student Directory', path: '/ojt-professor/students', icon: Users },
    { name: 'Document Review', path: '/ojt-professor/document-review', icon: FileCheck },
    { name: 'WAR Review', path: '/ojt-professor/war-review', icon: BookOpen },
    { name: 'Progress Monitoring', path: '/ojt-professor/monitoring', icon: Activity },
    { name: 'Completion Validation', path: '/ojt-professor/completion-validation', icon: Unlock },
    { name: 'Visit Itinerary', path: '/ojt-professor/visit-itinerary', icon: Map },
    { name: 'Grade Management', path: '/ojt-professor/grades', icon: ClipboardCheck },
    { name: 'Reports Dashboard', path: '/ojt-professor/reports', icon: BarChart2 },
    { name: 'Profile Settings', path: '/ojt-professor/profile', icon: User },
  ];

  const styles = {
    sidebar: {
      width: '270px',
      height: '100vh',
      backgroundColor: '#1e293b',
      color: '#fff',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
    },
    brand: {
      padding: '32px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    brandText: {
      fontSize: '1.25rem',
      fontWeight: 800,
      color: theme.colors.accent,
    },
    nav: {
      flex: 1,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflowY: 'auto',
    },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: '12px',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: 600,
      transition: 'all 0.2s ease',
    }),
    footer: {
      padding: '20px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={{ backgroundColor: theme.colors.accent, padding: '6px', borderRadius: '8px', color: '#fff' }}>
          <GraduationCap size={20} />
        </div>
        <span style={styles.brandText}>OJT Head</span>
      </div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => styles.navLink(isActive)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
          </NavLink>
        ))}
      </nav>
      <div style={styles.footer}>
        <div
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          style={{ ...styles.navLink(false), cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
