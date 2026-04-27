// src/components/layout/dean/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronRight, LayoutDashboard, UserPlus, BarChart2, Building, Bell, User, LogOut
} from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { theme } from '../../../styles/theme';

const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isOpen] = useState(!isMobile);

  const navItems = [
    { name: 'Dashboard', path: '/dean/dashboard', icon: LayoutDashboard },
    { name: 'Program Oversight', path: '/dean/programs', icon: BarChart2 },
    { name: 'Manage Chairs', path: '/dean/chairs', icon: UserPlus },
    { name: 'Partnership Reports', path: '/dean/partnerships', icon: Building },
  ];

  const styles = {
    sidebar: {
      width: '270px',
      height: '100vh',
      backgroundColor: theme.colors.primary, // Blue for Dean
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
      color: '#fbbf24', // Gold accent
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
      backgroundColor: isActive ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
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
        <div style={{ backgroundColor: '#fbbf24', padding: '6px', borderRadius: '8px', color: '#2e1065' }}>
          <Building size={20} />
        </div>
        <span style={styles.brandText}>Dean Portal</span>
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
    </aside>
  );
};

export default Sidebar;
