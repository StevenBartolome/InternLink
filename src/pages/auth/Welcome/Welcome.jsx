import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, PartyPopper, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { theme } from '../../../styles/theme';

const Welcome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const styles = {
    page: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1e3a8a 100%)`,
      color: '#fff',
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'center',
      padding: '2rem',
      overflow: 'hidden',
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      padding: '3rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    },
    sub: {
      fontSize: '1.1rem',
      opacity: 0.9,
      marginBottom: '2.5rem',
      lineHeight: 1.6,
    },
    btnGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    primaryBtn: {
      padding: '1rem 2rem',
      backgroundColor: '#fbbf24',
      color: '#1e3a8a',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'transform 0.2s',
    },
    outlineBtn: {
      padding: '1rem 2rem',
      backgroundColor: 'transparent',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '12px',
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Session Expired</h2>
          <button style={styles.primaryBtn} onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginBottom: '1.5rem', display: 'inline-block' }}
        >
          <PartyPopper size={64} color="#fbbf24" />
        </motion.div>
        
        <h1 style={styles.title}>
          Welcome, {user.first_name || 'Student'}!
        </h1>
        
        <p style={styles.sub}>
          You have successfully signed in to InternLink. Your professional internship journey starts here.
        </p>

        <div style={styles.btnGroup}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={styles.primaryBtn}
            onClick={() => navigate('/dashboard')}
          >
            Enter Dashboard <LayoutDashboard size={20} />
          </motion.button>
          
          <button 
            style={styles.outlineBtn}
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Sign Out
          </button>
        </div>
      </motion.div>
      
      {/* Decorative shapes */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity }}
        style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1 }}
      >
        <GraduationCap size={120} />
      </motion.div>
    </div>
  );
};

export default Welcome;
