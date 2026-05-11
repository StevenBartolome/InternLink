import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, User, Bell, LogOut, GraduationCap, ChevronDown, ChevronUp
} from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { logout } = useAuth();

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
  ];

  const brandName = 'InternLink';

  const styles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: isMobile ? (isOpen ? '280px' : '0') : '260px',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      zIndex: 1000,
      transition: theme.transitions.default,
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: theme.shadows.lg,
    },
    brand: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '12px',
    },
    brandText: {
      fontSize: '1.25rem',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },
    nav: {
      flex: 1,
      padding: '0 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflowY: 'auto',
    },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: theme.transitions.default,
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    }),
    subLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px 10px 48px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      textDecoration: 'none',
      transition: theme.transitions.default,
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
    }),
    mobileToggle: {
      position: 'fixed',
      top: '16px',
      left: '16px',
      zIndex: 1100,
      backgroundColor: theme.colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '8px',
      display: isMobile ? 'flex' : 'none',
      cursor: 'pointer',
      boxShadow: theme.shadows.md,
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: isMobile && isOpen ? 'block' : 'none',
    }
  };

  return (
    <>
      <button style={styles.mobileToggle} onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div style={styles.backdrop} onClick={toggleSidebar}></div>

      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <GraduationCap size={24} />
          <span style={styles.brandText}>{brandName}</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item, index) => {
            if (item.subItems) {
              const isOpenMenu = openSubmenus[item.name];
              return (
                <div key={index}>
                  <div 
                    style={{ ...styles.navLink(false), cursor: 'pointer', justifyContent: 'space-between' }} 
                    onClick={() => toggleSubmenu(item.name)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {isOpenMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {isOpenMenu && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      {item.subItems.map((sub, sIndex) => (
                        <NavLink 
                          key={sIndex} 
                          to={sub.path} 
                          style={({ isActive }) => styles.subLink(isActive)}
                          onClick={() => isMobile && setIsOpen(false)}
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink 
                key={index} 
                to={item.path} 
                style={({ isActive }) => styles.navLink(isActive)}
                onClick={() => isMobile && setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              width: '100%', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: theme.transitions.default,
            }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

