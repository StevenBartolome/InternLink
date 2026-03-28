// src/screens/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, EyeOff, LayoutDashboard, Info, ArrowRightCircle } from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Login = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectPath, setRedirectPath] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const userSession = localStorage.getItem('internlink_session');

  useEffect(() => {
    if (userSession) {
      navigate(userSession);
    }
  }, [userSession, navigate]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const credentials = {
      'student@gmail.com': '/dashboard',
      'employer@gmail.com': '/employer/dashboard',
      'supervisor@gmail.com': '/supervisor/dashboard',
      'coordinator@gmail.com': '/coordinator/dashboard',
      'admin@gmail.com': '/admin/dashboard'
    };

    if (credentials[email] && password === '123') {
      setError('');
      localStorage.setItem('internlink_session', credentials[email]);
      setRedirectPath(credentials[email]);
      setIsModalOpen(true);
    } else {
      setError('Invalid email or password. Use student, employer, supervisor, coordinator, or admin @gmail.com (pw: 123)');
    }
  };

  const styles = {
    authSplit: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    },
    brandSide: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      padding: isMobile ? '2rem' : '4rem',
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      color: theme.colors.white,
      justifyContent: 'space-between',
    },
    brandHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1.5rem',
      fontWeight: 800,
    },
    brandLogo: {
      backgroundColor: '#EAB308',
      color: theme.colors.primary,
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandContent: {
      marginBottom: '6rem',
    },
    brandTitle: {
      fontSize: '3rem',
      lineHeight: 1.2,
      marginBottom: '1.5rem',
      fontWeight: 800,
      fontFamily: "'Outfit', sans-serif",
    },
    textYellow: {
      color: '#EAB308',
    },
    brandP: {
      fontSize: '1.05rem',
      lineHeight: 1.6,
      maxWidth: '450px',
      opacity: 0.85,
    },
    formSide: {
      flex: 1,
      backgroundColor: theme.colors.white,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowY: 'auto',
    },
    backBar: {
      padding: isMobile ? '1.5rem' : '2rem 4rem',
    },
    btnBackLink: (isHovered) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.6rem 1.2rem',
      borderRadius: '6px',
      border: `1px solid ${theme.colors.border}`,
      background: isHovered ? theme.colors.bgSecondary : 'transparent',
      color: theme.colors.textMuted,
      fontWeight: 600,
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: theme.transitions.default,
    }),
    formContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '450px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem',
    },
    formHeader: {
      marginBottom: '2rem',
    },
    formTitle: {
      fontSize: '2rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      marginBottom: '0.5rem',
      fontFamily: "'Outfit', sans-serif",
    },
    formSubtitle: {
      color: theme.colors.textMuted,
      fontSize: '0.95rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.75rem 2.8rem 0.75rem 1rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      backgroundColor: '#F8FAFC',
      fontSize: '0.95rem',
      color: theme.colors.textMain,
      transition: theme.transitions.default,
    },
    inputIcon: {
      position: 'absolute',
      right: '1rem',
      color: '#94A3B8',
      pointerEvents: 'none',
    },
    formOptions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.85rem',
      margin: '0.5rem 0 2rem 0',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.textMuted,
      cursor: 'pointer',
    },
    forgotLink: (isHovered) => ({
      color: theme.colors.primary,
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: isHovered ? 'underline' : 'none',
    }),
    btnLogin: (isHovered) => ({
      width: '100%',
      padding: '0.875rem',
      backgroundColor: '#EAB308',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: isHovered ? theme.shadows.md : theme.shadows.sm,
      transform: isHovered ? 'translateY(-1px)' : 'none',
      transition: 'all 0.2s ease',
    }),
    authSwitch: {
      textAlign: 'center',
      marginTop: '2rem',
      fontSize: '0.9rem',
      color: theme.colors.textMuted,
    },
    switchLink: {
      color: theme.colors.primary,
      fontWeight: 600,
      cursor: 'pointer',
    },
    infoBanner: {
      marginTop: '3rem',
      backgroundColor: '#EFF6FF',
      border: `1px solid #DBEAFE`,
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      gap: '12px',
      color: '#1E3A8A',
    },
    infoTitle: {
      fontSize: '0.9rem',
      fontWeight: 800,
      margin: '0 0 4px 0',
    },
    infoText: {
      fontSize: '0.8rem',
      lineHeight: 1.5,
      margin: 0,
      opacity: 0.9,
    }
  };

  return (
    <div style={styles.authSplit}>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate(redirectPath);
        }} 
        title="Login Successful" 
        message="Welcome back to InternLink! Redirecting you to your dashboard mock shortly." 
      />

      {/* Left Brand Side */}
      <div style={styles.brandSide}>
        <div style={styles.brandHeader}>
          <div style={styles.brandLogo}>
            <GraduationCap size={24} />
          </div>
          <span>InternLink</span>
        </div>
        
        <div style={styles.brandContent}>
          <h1 style={styles.brandTitle}>
            Building your <br />
            <span style={styles.textYellow}>professional career</span> <br />
            together.
          </h1>
          <p style={styles.brandP}>
            Access your profile, track applications, and manage your 
            internships securely through our unified portal.
          </p>
        </div>
        
        <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} InternLink. Build v1.0.4
        </div>
      </div>

      {/* Right Form Side */}
      <div style={styles.formSide}>
        <div style={styles.backBar}>
          <button 
            style={styles.btnBackLink(hoveredBtn === 'back')} 
            onMouseEnter={() => setHoveredBtn('back')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '0.85rem', 
                marginBottom: '1.5rem', 
                backgroundColor: '#fef2f2', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                border: '1px solid #fca5a5',
                display: 'flex',
                gap: '8px'
              }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Email or Username</label>
              <div style={styles.inputWrapper}>
                <input 
                  style={styles.input}
                  type="email" 
                  id="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                <Mail size={18} style={styles.inputIcon} />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="password">Password</label>
              <div style={styles.inputWrapper}>
                <input 
                  style={styles.input}
                  type="password" 
                  id="password" 
                  placeholder="••••••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <EyeOff size={18} style={styles.inputIcon} />
              </div>
            </div>

            <div style={styles.formOptions}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={{ cursor: 'pointer' }} /> Keep me logged in
              </label>
              <span 
                style={styles.forgotLink(hoveredBtn === 'forgot')}
                onMouseEnter={() => setHoveredBtn('forgot')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </span>
            </div>

            <button 
              type="submit" 
              style={styles.btnLogin(hoveredBtn === 'login')}
              onMouseEnter={() => setHoveredBtn('login')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Log In <ArrowRightCircle size={20} />
            </button>
          </form>

          <p style={styles.authSwitch}>
            Don't have an account? <span style={styles.switchLink} onClick={() => navigate('/register')}>Register here</span>
          </p>

          <div style={styles.infoBanner}>
            <LayoutDashboard size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={styles.infoTitle}>Unified Role Login</h4>
              <p style={styles.infoText}>The system automatically detects your role (Student, Employer, etc.) and directs you to the correct dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
