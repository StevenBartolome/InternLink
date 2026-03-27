// src/components/Features/Features.jsx
import React, { useState } from 'react';
import { GraduationCap, Briefcase, Check } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Features = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hoveredCard, setHoveredCard] = useState(null);

  const styles = {
    sectionFeatures: {
      padding: isMobile ? '3rem 1rem' : '5rem 10%',
      backgroundColor: theme.colors.white,
    },
    sectionHeader: {
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto 3.5rem auto',
    },
    h2: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      color: theme.colors.primary,
      marginBottom: '0.8rem',
      fontWeight: 800,
    },
    headerP: {
      color: theme.colors.textMuted,
      fontSize: '1.1rem',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    featureCard: (id) => ({
      ...commonStyles.dashboardCard,
      padding: '2.5rem',
      transition: 'all 0.3s ease',
      transform: hoveredCard === id ? 'translateY(-5px)' : 'none',
      borderColor: hoveredCard === id ? theme.colors.primary : theme.colors.border,
      boxShadow: hoveredCard === id ? theme.shadows.md : theme.shadows.sm,
      backgroundColor: theme.colors.bgSecondary,
    }),
    featureIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.25rem',
      backgroundColor: '#EFF6FF',
      color: theme.colors.primary,
    },
    cardH3: {
      fontSize: '1.5rem',
      color: theme.colors.textMain,
      marginBottom: '0.75rem',
      fontWeight: 700,
    },
    cardP: {
      color: theme.colors.textMuted,
      fontSize: '0.95rem',
      marginBottom: '1.5rem',
      lineHeight: 1.6,
    },
    featureList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    featureListItem: {
      fontSize: '0.95rem',
      color: theme.colors.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '0.75rem',
    },
    checkIcon: {
      color: theme.colors.primary,
    }
  };

  const featureData = [
    {
      id: 'student',
      icon: <GraduationCap size={24} />,
      title: 'For Students',
      desc: 'Create your profile, showcase your skills, and let opportunities find you.',
      items: ['Create Detailed Profile', 'List Skills & Interests', 'Browse Internship Feeds']
    },
    {
      id: 'employer',
      icon: <Briefcase size={24} />,
      title: 'For Employers',
      desc: 'Discover matched talent curated specifically for your vacancies.',
      items: ['Create Company Account', 'Post Internship Opportunities', 'View Student Profiles']
    }
  ];

  return (
    <section style={styles.sectionFeatures} id="features">
      <div style={styles.sectionHeader}>
        <h2 style={styles.h2}>Tailored For Full Ecosystem</h2>
        <p style={styles.headerP}>Connecting students and companies simply and efficiently.</p>
      </div>

      <div style={styles.featuresGrid}>
        {featureData.map((feature) => (
          <div 
            key={feature.id}
            style={styles.featureCard(feature.id)}
            onMouseEnter={() => setHoveredCard(feature.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon}>
              {feature.icon}
            </div>
            <h3 style={styles.cardH3}>{feature.title}</h3>
            <p style={styles.cardP}>{feature.desc}</p>
            <ul style={styles.featureList}>
              {feature.items.map((item, idx) => (
                <li key={idx} style={styles.featureListItem}>
                  <Check size={16} style={styles.checkIcon} /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
