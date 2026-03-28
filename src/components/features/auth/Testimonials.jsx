// src/components/features/auth/Testimonials.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Computer Science Student',
    content: 'InternLink made finding an internship so much easier. The skill matching was spot on!',
    rating: 5,
  },
  {
    name: 'Robert Chen',
    role: 'HR Manager at TechFlow',
    content: 'The platform streamlined our internship recruitment process. Quality of candidates is exceptional.',
    rating: 5,
  },
  {
    name: 'Maria Garcia',
    role: 'University Coordinator',
    content: 'Monitoring student progress has never been more organized. A game-changer for our department.',
    rating: 5,
  },
];

const Testimonials = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const styles = {
    section: {
      padding: isMobile ? '4rem 1rem' : '6rem 10%',
      backgroundColor: theme.colors.bgSecondary,
      overflow: 'hidden',
    },
    header: {
      textAlign: 'center',
      marginBottom: '4rem',
    },
    title: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      marginBottom: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    card: {
      backgroundColor: theme.colors.white,
      padding: '2rem',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      border: `1px solid ${theme.colors.border}`,
    },
    quoteIcon: {
      position: 'absolute',
      top: '-15px',
      left: '20px',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      padding: '8px',
      borderRadius: '12px',
      boxShadow: theme.shadows.md,
    },
    content: {
      color: theme.colors.textMuted,
      lineHeight: 1.7,
      marginBottom: '1.5rem',
      fontSize: '1rem',
      fontStyle: 'italic',
    },
    footer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    name: {
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    role: {
      fontSize: '0.85rem',
      color: theme.colors.primary,
      fontWeight: 600,
    },
    stars: {
      display: 'flex',
      gap: '2px',
      marginTop: '0.5rem',
      color: '#FBBF24',
    }
  };

  return (
    <section style={styles.section} id="testimonials">
      <motion.div 
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 style={styles.title}>What People Say</h2>
        <div style={{ width: '60px', height: '4px', backgroundColor: theme.colors.primary, margin: '0 auto', borderRadius: '2px' }} />
      </motion.div>

      <motion.div 
        style={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {testimonials.map((t, i) => (
          <motion.div key={i} style={styles.card} variants={itemVariants} whileHover={{ y: -10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={styles.quoteIcon}>
              <Quote size={20} />
            </div>
            <p style={styles.content}>"{t.content}"</p>
            <div style={styles.footer}>
              <div style={styles.name}>{t.name}</div>
              <div style={styles.role}>{t.role}</div>
              <div style={styles.stars}>
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;
