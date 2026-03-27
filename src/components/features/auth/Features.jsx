// src/components/features/auth/Features.jsx
import React, { useState } from 'react';
import { Search, Building2, ClipboardCheck, TrendingUp, ShieldCheck, Users } from 'lucide-react';
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

  const styles = {
    section: {
      padding: isMobile ? '3rem 1rem' : '5rem 10%',
      backgroundColor: theme.colors.bgPrimary,
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
    },
    sectionLabel: {
      display: 'inline-block',
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      fontWeight: 700,
      fontSize: '0.8rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '0.35rem 1rem',
      borderRadius: '9999px',
      marginBottom: '1rem',
    },
    h2: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 1rem',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '1.05rem',
      maxWidth: '560px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    card: (id) => ({
      backgroundColor: hoveredCard === id ? theme.colors.bgAccent : theme.colors.bgSecondary,
      border: `1px solid ${hoveredCard === id ? theme.colors.secondary : theme.colors.border}`,
      borderRadius: '16px',
      padding: '2rem',
      transition: theme.transitions.default,
      transform: hoveredCard === id ? 'translateY(-4px)' : 'none',
      boxShadow: hoveredCard === id
        ? '0 10px 25px -5px rgba(30, 64, 175, 0.15)'
        : '0 1px 3px rgba(0,0,0,0.04)',
      cursor: 'default',
    }),
    iconWrapper: (id) => ({
      width: '52px',
      height: '52px',
      borderRadius: '12px',
      backgroundColor: hoveredCard === id ? theme.colors.primary : theme.colors.bgAccent,
      color: hoveredCard === id ? theme.colors.white : theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.25rem',
      transition: theme.transitions.default,
    }),
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      marginBottom: '0.5rem',
    },
    cardDesc: {
      fontSize: '0.95rem',
      color: theme.colors.textMuted,
      lineHeight: 1.6,
    },
  };

  return (
    <section style={styles.section} id="features">
      <div style={styles.header}>
        <span style={styles.sectionLabel}>Platform Features</span>
        <h2 style={styles.h2}>Everything You Need to Succeed</h2>
        <p style={styles.subtitle}>
          InternLink provides a complete suite of tools for students, employers, and schools to manage internships efficiently.
        </p>
      </div>
      <div style={styles.grid}>
        {featureList.map((feature, idx) => (
          <div
            key={idx}
            style={styles.card(idx)}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.iconWrapper(idx)}>{feature.icon}</div>
            <div style={styles.cardTitle}>{feature.title}</div>
            <p style={styles.cardDesc}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
