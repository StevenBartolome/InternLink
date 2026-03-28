// src/components/Hero/Hero.jsx
import React, { useState } from 'react';
import { Bolt, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Hero = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
  };

  const FloatingShape = ({ delay, color, size, top, left }) => (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        backgroundColor: color,
        filter: 'blur(40px)',
        zIndex: 0,
        opacity: 0.4,
      }}
      animate={{
        y: [0, 50, 0],
        x: [0, 30, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );

  const styles = {
    hero: {
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: isMobile ? '4rem 1.5rem' : '0 1rem',
      backgroundColor: theme.colors.bgSecondary,
      position: 'relative',
      overflow: 'hidden',
    },
    heroContent: {
      maxWidth: '900px',
      position: 'relative',
      zIndex: 1,
    },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: theme.colors.bgAccent,
      border: `1px solid ${theme.colors.border}`,
      padding: '0.6rem 1.2rem',
      borderRadius: '9999px',
      color: theme.colors.primary,
      fontSize: '0.9rem',
      fontWeight: 700,
      marginBottom: '2rem',
      boxShadow: '0 4px 15px rgba(30, 64, 175, 0.1)',
    },
    h1: {
      fontSize: isMobile ? '2.8rem' : '4.5rem',
      fontWeight: 900,
      lineHeight: 1.1,
      marginBottom: '1.5rem',
      color: theme.colors.textMain,
      letterSpacing: '-0.02em',
    },
    textGradient: {
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
    },
    p: {
      fontSize: isMobile ? '1.15rem' : '1.35rem',
      color: theme.colors.textMuted,
      marginBottom: '3rem',
      maxWidth: '700px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: 1.6,
    },
    heroActions: {
      display: 'flex',
      gap: '1.25rem',
      justifyContent: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
    },
    btnPrimary: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: 700,
      backgroundColor: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      color: theme.colors.white,
      width: isMobile ? '100% ' : 'auto',
      boxShadow: isHovered ? '0 10px 25px rgba(30, 64, 175, 0.4)' : theme.shadows.md,
      transform: isHovered ? 'translateY(-2px)' : 'none',
      transition: 'all 0.3s ease',
    }),
    btnGhost: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: 700,
      backgroundColor: isHovered ? theme.colors.bgAccent : theme.colors.white,
      border: `2px solid ${theme.colors.border}`,
      color: theme.colors.textMain,
      width: isMobile ? '100%' : 'auto',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      transition: 'all 0.3s ease',
    })
  };

  return (
    <section style={styles.hero} id="home">
      {/* Dynamic Background Elements */}
      <FloatingShape delay={0} color="#E0E7FF" size="300px" top="-10%" left="-5%" />
      <FloatingShape delay={2} color="#DBEAFE" size="250px" top="60%" left="80%" />
      <FloatingShape delay={4} color="#F0F9FF" size="200px" top="20%" left="70%" />
      
      <motion.div 
        style={styles.heroContent}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div style={styles.heroBadge} variants={itemVariants}>
          <Zap size={18} fill={theme.colors.primary} />
          New: Skill-Based Matching Engine 2.0
        </motion.div>
        
        <motion.h1 style={styles.h1} variants={itemVariants}>
          The Smarter Way to <br />
          <span style={styles.textGradient}>Launch Your Career</span>
        </motion.h1>
        
        <motion.p style={styles.p} variants={itemVariants}>
          InternLink bridges the gap between ambition and opportunity. Connect with industry leaders through our AI-powered matching platform.
        </motion.p>
        
        <motion.div style={styles.heroActions} variants={itemVariants}>
          <button 
            style={styles.btnPrimary(hoveredBtn === 'find')}
            onMouseEnter={() => setHoveredBtn('find')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Get Started
          </button>
          <button 
            style={styles.btnGhost(hoveredBtn === 'post')}
            onMouseEnter={() => setHoveredBtn('post')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            For Employers
          </button>
        </motion.div>

        {/* Floating Mini Icons */}
        <motion.div
          style={{ position: 'absolute', top: '15%', right: '-10%', color: theme.colors.primary, opacity: 0.6 }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles size={32} />
        </motion.div>
        <motion.div
          style={{ position: 'absolute', bottom: '25%', left: '-15%', color: theme.colors.secondary, opacity: 0.6 }}
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Target size={40} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

