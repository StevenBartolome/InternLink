// src/components/features/auth/CTASection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  const styles = {
    section: {
      padding: isMobile ? '4rem 1rem' : '6rem 10%',
      backgroundColor: theme.colors.bgPrimary,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      maxWidth: '1000px',
      width: '100%',
      background: theme.gradients.primary,
      borderRadius: '32px',
      padding: isMobile ? '3rem 1.5rem' : '5rem 4rem',
      textAlign: 'center',
      color: theme.colors.white,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(30, 64, 175, 0.2)',
    },
    sparkle1: {
      position: 'absolute',
      top: '10%',
      left: '5%',
      opacity: 0.3,
    },
    sparkle2: {
      position: 'absolute',
      bottom: '10%',
      right: '5%',
      opacity: 0.3,
    },
    title: {
      fontSize: isMobile ? '2rem' : '3.5rem',
      fontWeight: 800,
      marginBottom: '1.5rem',
      lineHeight: 1.1,
    },
    description: {
      fontSize: isMobile ? '1.1rem' : '1.3rem',
      opacity: 0.9,
      marginBottom: '3rem',
      maxWidth: '600px',
      margin: '0 auto 3rem',
      lineHeight: 1.6,
    },
    button: {
      backgroundColor: theme.colors.white,
      color: theme.colors.primary,
      padding: '1rem 2.5rem',
      borderRadius: '9999px',
      fontSize: '1.1rem',
      fontWeight: 700,
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <section style={styles.section}>
      <motion.div 
        style={styles.container}
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div 
          style={styles.sparkle1}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles size={40} />
        </motion.div>
        
        <h2 style={styles.title}>Ready to Jumpstart Your Career?</h2>
        <p style={styles.description}>
          Join thousands of students and companies already using InternLink to build their future.
        </p>
        
        <motion.button 
          style={styles.button}
          whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
        >
          Join InternLink Today <ArrowRight size={20} />
        </motion.button>

        <motion.div 
          style={styles.sparkle2}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <Sparkles size={60} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;
