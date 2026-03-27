// src/components/Stats/Stats.jsx
import React from 'react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Stats = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = {
    statsBanner: {
      padding: isMobile ? '3rem 1rem' : '4rem 10%',
      backgroundColor: '#F8FAFC',
      borderTop: `1px solid ${theme.colors.border}`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      textAlign: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    h3: {
      fontSize: isMobile ? '2.2rem' : '2.8rem',
      fontWeight: 800,
      color: theme.colors.primary,
      margin: 0,
    },
    p: {
      color: theme.colors.textMain,
      fontSize: '0.9rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: 0,
    }
  };

  return (
    <section style={styles.statsBanner} id="impact">
      <div style={styles.statsGrid}>
        <div style={styles.statItem}>
          <h3 style={styles.h3}>1.2K+</h3>
          <p style={styles.p}>Students Placed</p>
        </div>
        <div style={styles.statItem}>
          <h3 style={styles.h3}>350+</h3>
          <p style={styles.p}>Active Companies</p>
        </div>
        <div style={styles.statItem}>
          <h3 style={styles.h3}>95%</h3>
          <p style={styles.p}>Success Match Rate</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
