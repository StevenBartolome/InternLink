// src/components/Stats/Stats.jsx
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const StatItem = ({ target, label, suffix = "" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target, count, rounded]);

  const styles = {
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1.5rem',
    },
    h3: {
      fontSize: '3.5rem',
      fontWeight: 900,
      color: theme.colors.primary,
      margin: 0,
      lineHeight: 1,
    },
    p: {
      color: theme.colors.textMuted,
      fontSize: '1rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      margin: 0,
    }
  };

  return (
    <div style={styles.statItem}>
      <motion.h3 
        style={styles.h3}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {displayValue}{suffix}
      </motion.h3>
      <motion.p 
        style={styles.p}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        {label}
      </motion.p>
    </div>
  );
};

const Stats = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = {
    statsBanner: {
      padding: isMobile ? '4rem 1rem' : '6rem 10%',
      backgroundColor: theme.colors.white,
      borderTop: `1px solid ${theme.colors.border}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      position: 'relative',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '2rem',
      textAlign: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    }
  };

  return (
    <section style={styles.statsBanner} id="impact">
      <div style={styles.statsGrid}>
        <StatItem target={1200} label="Students Placed" suffix="+" />
        <StatItem target={350} label="Active Companies" suffix="+" />
        <StatItem target={95} label="Success Match Rate" suffix="%" />
      </div>
    </section>
  );
};

export default Stats;

