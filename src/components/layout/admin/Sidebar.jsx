import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileCheck, Briefcase, 
  BarChart2, ShieldAlert, Settings, LogOut, GraduationCap,
  ChevronRight, Shield
} from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Internship Config', path: '/admin/internship-config', icon: Settings },
    { name: 'System Reports', path: '/admin/reports', icon: BarChart2 },
    { name: 'Notification Center', path: '/admin/notifications', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/admin/audit', icon: Shield },
  ];

  const styles = {
    sidebar: {
      width: '260px',
      height: '100vh',
      backgroundColor: theme.colors.primary,
      color: '#fff',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      transition: 'transform 0.3s ease',
      transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
      boxShadow: theme.shadows.lg,
    },
    brand: {
      padding: '32px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    brandText: {
      fontSize: '1.25rem',
      fontWeight: 800,
      letterSpacing: '0.5px',
    },
    nav: {
      flex: 1,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    }),
    footer: {
      padding: '24px 12px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      marginTop: 'auto',
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <GraduationCap size={28} />
        <span style={styles.brandText}>Admin Panel</span>
      </div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            style={({ isActive }) => styles.navLink(isActive)}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
