// src/components/features/auth/Features.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, ClipboardCheck, TrendingUp, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const featureList = [
  {
    icon: <Search size={28} />,
    title: 'Skill-Based Matching',
    description: 'Our algorithm connects students with internships that align with their skills, interests, and academic background.',
  },
  {
    icon: <Building2 size={28} />,
    title: 'Verified Companies',
    description: 'All partner companies go through a verification process to ensure quality and safe internship placements.',
  },
  {
    icon: <ClipboardCheck size={28} />,
    title: 'Easy Applications',
    description: 'Apply to multiple internships with a single profile. Track your application status in real time.',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Progress Monitoring',
    description: 'Coordinators and supervisors can monitor intern performance and milestones throughout the internship period.',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Compliant & Secure',
    description: 'Built to meet school and industry compliance standards, keeping student data private and secure.',
  },
  {
    icon: <Users size={28} />,
    title: 'Multi-Role Platform',
    description: 'Designed for students, employers, coordinators, and supervisors — all in one unified system.',
  },
];

const Features = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hoveredCard, setHoveredCard] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  };

  const styles = {
    section: {
      padding: isMobile ? '4rem 1.5rem' : '6rem 10%',
      backgroundColor: theme.colors.bgPrimary,
      position: 'relative',
    },
    header: {
      textAlign: 'center',
      marginBottom: '4rem',
    },
    sectionLabel: {
      display: 'inline-block',
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      fontWeight: 800,
      fontSize: '0.8rem',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '0.5rem 1.25rem',
      borderRadius: '9999px',
      marginBottom: '1.25rem',
      boxShadow: '0 2px 10px rgba(30, 64, 175, 0.05)',
    },
    h2: {
      fontSize: isMobile ? '2.2rem' : '3.2rem',
      fontWeight: 900,
      color: theme.colors.textMain,
      margin: '0 0 1.25rem',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '1.15rem',
      maxWidth: '650px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    card: (id) => ({
      backgroundColor: theme.colors.white,
      border: `1px solid ${hoveredCard === id ? theme.colors.primary : theme.colors.border}`,
      borderRadius: '24px',
      padding: '2.5rem',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      boxShadow: hoveredCard === id
        ? '0 20px 40px -10px rgba(30, 64, 175, 0.15)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    }),
    iconWrapper: (id) => ({
      width: '60px',
      height: '60px',
      borderRadius: '16px',
      backgroundColor: hoveredCard === id ? theme.colors.primary : theme.colors.bgAccent,
      color: hoveredCard === id ? theme.colors.white : theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      transition: 'all 0.3s ease',
      transform: hoveredCard === id ? 'rotate(-5deg) scale(1.1)' : 'none',
    }),
    cardTitle: {
      fontSize: '1.35rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      marginBottom: '0.75rem',
    },
    cardDesc: {
      fontSize: '1rem',
      color: theme.colors.textMuted,
      lineHeight: 1.6,
      marginBottom: '1.5rem',
    },
    learnMore: (id) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.primary,
      fontWeight: 700,
      fontSize: '0.9rem',
      opacity: hoveredCard === id ? 1 : 0,
      transform: hoveredCard === id ? 'translateX(0)' : 'translateX(-10px)',
      transition: 'all 0.3s ease',
    })
  };

  return (
    <section style={styles.section} id="features">
      <motion.div 
        style={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span style={styles.sectionLabel}>Powerful Platform</span>
        <h2 style={styles.h2}>Designed for Growth</h2>
        <p style={styles.subtitle}>
          We provide a comprehensive ecosystem that simplifies every aspect of the internship lifecycle.
        </p>
      </motion.div>

      <motion.div 
        style={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {featureList.map((feature, idx) => (
          <motion.div
            key={idx}
            style={styles.card(idx)}
            variants={cardVariants}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
            whileHover={{ y: -8 }}
          >
            <div style={styles.iconWrapper(idx)}>{feature.icon}</div>
            <div style={styles.cardTitle}>{feature.title}</div>
            <p style={styles.cardDesc}>{feature.description}</p>
            <div style={styles.learnMore(idx)}>
              Learn more <ArrowRight size={16} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Features;

