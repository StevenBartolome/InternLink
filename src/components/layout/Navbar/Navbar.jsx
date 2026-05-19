// src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Navbar = ({ onLogin, onRegister }) => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '1rem 5%' : '1.25rem 5%',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
    },
    navBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.primary,
      textDecoration: 'none',
      cursor: 'pointer',
    },
    navLinks: {
      display: isMobile ? 'none' : 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    navLink: (id) => ({
      color: hoveredLink === id ? theme.colors.primary : theme.colors.textMuted,
      textDecoration: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
      transition: theme.transitions.default,
    }),
    navButtons: {
      display: isMobile ? 'none' : 'flex',
      gap: '1rem',
    },
    btnGhost: (isHovered) => ({
      padding: '0.6rem 1.25rem',
      borderRadius: '8px',
      fontWeight: 600,
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: theme.transitions.default,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: isHovered ? theme.colors.bgSecondary : 'transparent',
      color: theme.colors.textMain,
    }),
    btnPrimary: (isHovered) => ({
      padding: '0.6rem 1.25rem',
      borderRadius: '8px',
      fontWeight: 600,
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: theme.transitions.default,
      border: 'none',
      backgroundColor: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      color: theme.colors.white,
      transform: isHovered ? 'translateY(-1px)' : 'none',
    }),
    mobileMenuBtn: {
      display: isMobile ? 'flex' : 'none',
      background: 'none',
      border: 'none',
      color: theme.colors.textMain,
      cursor: 'pointer',
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <GraduationCap size={28} />
        <span>InternLink</span>
      </div>
      
      <div style={styles.navLinks}>
        {['Process', 'Features', 'Impact'].map((item) => (
          <a 
            key={item}
            href={`#${item.toLowerCase()}`} 
            style={styles.navLink(item)}
            onMouseEnter={() => setHoveredLink(item)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {item}
          </a>
        ))}
      </div>

      <div style={styles.navButtons}>
        <button 
          style={styles.btnGhost(hoveredBtn === 'login')} 
          onMouseEnter={() => setHoveredBtn('login')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onLogin}
        >
          Login
        </button>
        <button 
          style={styles.btnPrimary(hoveredBtn === 'register')} 
          onMouseEnter={() => setHoveredBtn('register')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onRegister}
        >
          Get Started
        </button>
      </div>

      <button 
        style={styles.mobileMenuBtn} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Basic Mobile Menu - could be expanded */}
      {isMobile && isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: theme.colors.white,
          borderBottom: `1px solid ${theme.colors.border}`,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: theme.shadows.md,
        }}>
          {['Process', 'Features', 'Impact'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`} 
              style={{ ...styles.navLink(item), display: 'block' }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button style={styles.btnGhost(false)} onClick={() => { onLogin(); setIsMenuOpen(false); }}>Login</button>
          <button style={styles.btnPrimary(false)} onClick={() => { onRegister(); setIsMenuOpen(false); }}>Get Started</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
