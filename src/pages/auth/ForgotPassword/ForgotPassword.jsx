// src/pages/auth/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsSubmitted(true);
    // In a real app, this would trigger an API call
  };

  const styles = {
    forgotPage: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: theme.colors.bgSecondary,
      fontFamily: "'Inter', sans-serif",
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      maxWidth: '450px',
      width: '90%',
      backgroundColor: theme.colors.white,
      padding: isMobile ? '2rem' : '3.5rem',
      borderRadius: '24px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
      textAlign: 'center',
    },
    header: {
      marginBottom: '2.5rem',
    },
    logo: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      marginBottom: '0.75rem',
      fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      textAlign: 'left',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: theme.colors.textMain,
      display: 'block',
      marginBottom: '0.5rem',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 2.8rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      fontSize: '1rem',
      backgroundColor: '#F8FAFC',
      transition: 'all 0.2s ease',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      color: theme.colors.textMuted,
    },
    btnSubmit: (isHovered) => ({
      padding: '1rem',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      boxShadow: isHovered ? theme.shadows.md : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      transition: 'all 0.2s ease',
    }),
    btnBack: (isHovered) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.textMuted,
      fontWeight: 600,
      fontSize: '0.9rem',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      marginTop: '2rem',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      backgroundColor: isHovered ? '#F1F5F9' : 'transparent',
      transition: 'all 0.2s ease',
    }),
    successState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
    },
    successIcon: {
      color: theme.colors.success,
    }
  };

  return (
    <div style={styles.forgotPage}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <GraduationCap size={28} />
          </div>
          {!isSubmitted ? (
            <>
              <h1 style={styles.title}>Forgot Password?</h1>
              <p style={styles.subtitle}>
                No worries, we'll send you reset instructions.
              </p>
            </>
          ) : (
            <div style={styles.successState}>
              <CheckCircle size={64} style={styles.successIcon} />
              <h1 style={styles.title}>Check your email</h1>
              <p style={styles.subtitle}>
                We've sent a password reset link to <br />
                <strong>{email}</strong>
              </p>
            </div>
          )}
        </div>

        {!isSubmitted ? (
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p style={{ color: theme.colors.danger, fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              style={styles.btnSubmit(hoveredBtn === 'reset')}
              onMouseEnter={() => setHoveredBtn('reset')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Reset Password
            </button>
          </form>
        ) : (
          <button 
            style={styles.btnSubmit(hoveredBtn === 'reset')}
            onMouseEnter={() => setHoveredBtn('reset')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        )}

        {!isSubmitted && (
          <button 
            style={styles.btnBack(hoveredBtn === 'back')}
            onMouseEnter={() => setHoveredBtn('back')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
