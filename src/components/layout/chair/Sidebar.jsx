import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, UserCheck, CheckSquare, Bell, User, 
  LogOut, ChevronRight, LayoutDashboard, Database, UserPlus
} from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isOpen] = useState(!isMobile);

  const navItems = [
    { name: 'Dashboard', path: '/chair/dashboard', icon: LayoutDashboard },
    { name: 'Cohort Monitoring', path: '/chair/cohort', icon: Database },
    { name: 'Manage Coordinators', path: '/chair/coordinators-manage', icon: UserPlus },
    { name: 'Coordinator Oversight', path: '/chair/coordinators', icon: Users },
    { name: 'Grade Finalization', path: '/chair/grades', icon: CheckSquare },
    { name: 'Notifications', path: '/chair/notifications', icon: Bell },
    { name: 'Profile', path: '/chair/profile', icon: User },
  ];

  const styles = {
    sidebar: {
      width: '270px',
      height: '100vh',
      backgroundColor: '#0f172a', // Slate 900
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
      color: '#38bdf8', // Light blue accent
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
      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
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
        <div style={{ backgroundColor: '#38bdf8', padding: '6px', borderRadius: '8px', color: '#0f172a' }}>
          <UserCheck size={20} />
        </div>
        <span style={styles.brandText}>Program Chair</span>
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
        <div 
          onClick={() => {
            localStorage.removeItem('internlink_session');
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
