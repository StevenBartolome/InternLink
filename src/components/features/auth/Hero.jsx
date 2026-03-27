// src/components/Hero/Hero.jsx
import React, { useState } from 'react';
import { Bolt } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Hero = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const styles = {
    hero: {
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: isMobile ? '2rem 1rem' : '0 1rem',
      backgroundColor: theme.colors.bgSecondary,
      background: `radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.05) 0%, transparent 70%)`,
    },
    heroContent: {
      maxWidth: '800px',
    },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#EFF6FF',
      border: `1px solid ${theme.colors.border}`,
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      color: theme.colors.primary,
      fontSize: '0.85rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      boxShadow: theme.shadows.sm,
    },
    h1: {
      fontSize: isMobile ? '2.5rem' : '3.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      marginBottom: '1rem',
      color: theme.colors.textMain,
    },
    textGradient: {
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
    },
    p: {
      fontSize: isMobile ? '1.1rem' : '1.2rem',
      color: theme.colors.textMuted,
      marginBottom: '2.5rem',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: 1.6,
    },
    heroActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
    },
    btnPrimary: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      padding: '0.75rem 2rem',
      fontSize: '1rem',
      backgroundColor: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      color: theme.colors.white,
      width: isMobile ? '100% ' : 'auto',
      boxShadow: isHovered ? theme.shadows.md : theme.shadows.sm,
    }),
    btnGhost: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      padding: '0.75rem 2rem',
      fontSize: '1rem',
      backgroundColor: isHovered ? theme.colors.bgSecondary : 'transparent',
      border: `1px solid ${theme.colors.border}`,
      color: theme.colors.textMain,
      width: isMobile ? '100%' : 'auto',
    })
  };

  return (
    <section style={styles.hero} id="home">
      <div style={styles.heroContent}>
        <div style={styles.heroBadge}>
          <Bolt size={16} />
          Skill-Based Internship Matching
        </div>
        <h1 style={styles.h1}>
          InternLink – A School-Based Internship <br />
          <span style={styles.textGradient}>Matching and Monitoring System</span>
        </h1>
        <p style={styles.p}>
          InternLink connects students with employers based on skills and interests. Simple, automated, and effective.
        </p>
        <div style={styles.heroActions}>
          <button 
            style={styles.btnPrimary(hoveredBtn === 'find')}
            onMouseEnter={() => setHoveredBtn('find')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Find Internships
          </button>
          <button 
            style={styles.btnGhost(hoveredBtn === 'post')}
            onMouseEnter={() => setHoveredBtn('post')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Post Opportunities
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
