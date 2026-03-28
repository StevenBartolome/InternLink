// src/components/features/auth/HowItWorks.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, CheckCircle } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const steps = [
  {
    icon: <UserPlus size={32} />,
    title: 'Create Profile',
    description: 'Sign up and showcase your skills, projects, and academic achievements.',
  },
  {
    icon: <Search size={32} />,
    title: 'Smart Match',
    description: 'Our system suggests internships that perfectly align with your profile.',
  },
  {
    icon: <CheckCircle size={32} />,
    title: 'Get Placed',
    description: 'Apply with one click and start your professional journey.',
  },
];

const HowItWorks = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    },
  };

  const styles = {
    section: {
      padding: isMobile ? '4rem 1rem' : '6rem 10%',
      backgroundColor: theme.colors.bgPrimary,
      position: 'relative',
      overflow: 'hidden',
    },
    header: {
      textAlign: 'center',
      marginBottom: '5rem',
    },
    title: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      marginBottom: '1rem',
    },
    grid: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
    },
    stepItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      zIndex: 2,
    },
    iconCircle: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      border: `2px solid ${theme.colors.primaryLight}`,
      boxShadow: `0 0 20px ${theme.colors.bgAccent}`,
    },
    stepTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      marginBottom: '0.75rem',
    },
    stepDesc: {
      color: theme.colors.textMuted,
      fontSize: '0.95rem',
      lineHeight: 1.6,
      maxWidth: '280px',
    },
    connector: {
      position: 'absolute',
      top: '40px',
      left: '15%',
      right: '15%',
      height: '2px',
      borderTop: `2px dashed ${theme.colors.border}`,
      zIndex: 1,
      display: isMobile ? 'none' : 'block',
    }
  };

  return (
    <section style={styles.section} id="how-it-works">
      <motion.div 
        style={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span style={{ color: theme.colors.primary, fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>A Simple 3-Step Process</span>
        <h2 style={styles.title}>How It Works</h2>
      </motion.div>

      <motion.div 
        style={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div style={styles.connector} />
        {steps.map((step, i) => (
          <motion.div key={i} style={styles.stepItem} variants={itemVariants}>
            <motion.div 
              style={styles.iconCircle}
              whileHover={{ scale: 1.1, backgroundColor: theme.colors.primary, color: theme.colors.white }}
            >
              {step.icon}
            </motion.div>
            <h3 style={styles.stepTitle}>{step.title}</h3>
            <p style={styles.stepDesc}>{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HowItWorks;
