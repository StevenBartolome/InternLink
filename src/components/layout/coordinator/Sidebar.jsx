import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, FileCheck, FileText, BarChart2, 
  Bell, User, LogOut, GraduationCap, ChevronRight,
  ClipboardCheck, Search, Database
} from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isOpen, setIsOpen] = useState(!isMobile);

  const navItems = [
    { name: 'Dashboard', path: '/coordinator/dashboard', icon: BarChart2 },
    { name: 'Student Directory', path: '/coordinator/students', icon: Users },
    { name: 'Application Tracking', path: '/coordinator/applications', icon: Search },
    { name: 'Automated Matching', path: '/coordinator/matching', icon: Database },
    { name: 'Internship Approvals', path: '/coordinator/approvals', icon: FileCheck },
    { name: 'Monitoring & Logs', path: '/coordinator/monitoring', icon: ClipboardCheck },
    { name: 'Grades & Evaluations', path: '/coordinator/grades', icon: FileText },
    { name: 'Reports', path: '/coordinator/reports', icon: BarChart2 },
    { name: 'Notifications', path: '/coordinator/notifications', icon: Bell },
  ];

  const styles = {
    sidebar: {
      width: '270px',
      height: '100vh',
      backgroundColor: '#1e293b', // Darker navy for coordinator
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
        <span style={styles.brandText}>Coordinator</span>
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
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>
        ))}
      </nav>
      <div style={styles.footer}>
        <NavLink to="/login" style={styles.navLink(false)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
