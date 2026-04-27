// src/pages/auth/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, ArrowLeft, Mail, EyeOff, 
  LayoutDashboard, Info, ArrowRight, 
  Github, Chrome, Linkedin 
} from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import { theme } from '../../../styles/theme';
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
      'admin@gmail.com': '/admin/dashboard',
      'dean@gmail.com': '/dean/dashboard',
      'chair@gmail.com': '/chair/dashboard'
    };

    if (credentials[email] && password === '123') {
      setError('');
      localStorage.setItem('internlink_session', credentials[email]);
      setRedirectPath(credentials[email]);
      setIsModalOpen(true);
    } else {
      setError('Invalid email or password. Use your role-based email (pw: 123)');
    }
  };

  const styles = {
    authSplit: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#f8fafc',
    },
    brandSide: {
      flex: 1.2,
      position: 'relative',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1e3a8a 100%)`,
      padding: '4rem',
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#fff',
      overflow: 'hidden',
    },
    floatingShape: {
      position: 'absolute',
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      background: 'rgba(255, 255, 255, 0.05)',
      filter: 'blur(40px)',
      zIndex: 1,
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1.5rem',
      fontWeight: 800,
      fontFamily: "'Outfit', sans-serif",
      zIndex: 10,
    },
    logoIcon: {
      backgroundColor: '#fbbf24',
      color: theme.colors.primary,
      width: '42px',
      height: '42px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
    brandContent: {
      maxWidth: '480px',
      zIndex: 10,
    },
    brandTitle: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      marginBottom: '1.5rem',
      fontFamily: "'Outfit', sans-serif",
    },
    brandP: {
      fontSize: '1.1rem',
      lineHeight: 1.7,
      opacity: 0.8,
      marginBottom: '2rem',
    },
    formSide: {
      flex: 1,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.02)',
      zIndex: 20,
    },
    formContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '440px',
      width: '100%',
      margin: '0 auto',
      padding: isMobile ? '2rem' : '4rem 2rem',
    },
    formHeader: {
      marginBottom: '2.5rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 800,
      color: '#0f172a',
      marginBottom: '0.75rem',
      fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1rem',
    },
    socialContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '2rem',
    },
    socialBtn: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: '#cbd5e1',
      fontSize: '0.85rem',
      marginBottom: '2rem',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e2e8f0',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#334155',
      marginBottom: '0.5rem',
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 2.75rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
    },
    btnSubmit: (isHovered) => ({
      width: '100%',
      padding: '1rem',
      backgroundColor: theme.colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: isHovered ? '0 10px 15px -3px rgba(30, 58, 138, 0.3)' : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      transition: 'all 0.2s ease',
    }),
    authFooter: {
      marginTop: '2rem',
      textAlign: 'center',
      fontSize: '0.925rem',
      color: '#64748b',
    },
    link: {
      color: theme.colors.primary,
      fontWeight: 700,
      textDecoration: 'none',
      cursor: 'pointer',
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
        message="Welcome back to InternLink! You're being redirected to your dashboard." 
      />

      {/* Brand Side */}
      <div style={styles.brandSide}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ ...styles.floatingShape, width: '400px', height: '400px', top: '-10%', left: '-10%' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ ...styles.floatingShape, width: '300px', height: '300px', bottom: '10%', right: '-5%' }} 
        />

        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <GraduationCap size={26} />
          </div>
          <span style={{ color: '#fff' }}>InternLink</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={styles.brandContent}
        >
          <h1 style={styles.brandTitle}>
            Step into your <br />
            <span style={{ color: '#fbbf24' }}>Future Career</span> <br />
            Today.
          </h1>
          <p style={styles.brandP}>
            Connect with top employers, manage your applications, 
            and kickstart your professional journey with precision.
          </p>
          
          <div style={{ display: 'flex', gap: '30px', marginTop: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>10k+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Interns</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>500+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Companies</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>98%</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Match Rate</div>
            </div>
          </div>
        </motion.div>

        <div style={{ opacity: 0.5, fontSize: '0.85rem', zIndex: 10 }}>
          &copy; {new Date().getFullYear()} InternLink. Designed for Excellence.
        </div>
      </div>

      {/* Form Side */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={styles.formSide}
      >
        <div style={{ padding: '2rem 4rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'none', border: 'none', color: '#64748b', 
              fontWeight: 600, cursor: 'pointer', transition: '0.2s' 
            }}
          >
            <ArrowLeft size={18} /> Back to website
          </button>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <motion.h2 variants={itemVariants} style={styles.title}>Welcome Back</motion.h2>
            <motion.p variants={itemVariants} style={styles.subtitle}>Enter your credentials to access your portal</motion.p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', 
                borderRadius: '12px', color: '#dc2626', fontSize: '0.875rem', 
                marginBottom: '1.5rem', display: 'flex', gap: '10px' 
              }}
            >
              <Info size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ ...styles.formGroup, marginBottom: '2rem' }}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <EyeOff size={18} style={styles.inputIcon} />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <span 
                  onClick={() => navigate('/forgot-password')}
                  style={{ fontSize: '0.85rem', color: theme.colors.primary, fontWeight: 700, cursor: 'pointer' }}
                >
                  Forgot password?
                </span>
              </div>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              style={styles.btnSubmit(hoveredBtn === 'login')}
              onMouseEnter={() => setHoveredBtn('login')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Sign In <ArrowRight size={20} />
            </motion.button>
          </form>

          <motion.div variants={itemVariants} style={{ ...styles.divider, marginTop: '2.5rem' }}>
            <div style={styles.dividerLine} />
            <span>or sign in with</span>
            <div style={styles.dividerLine} />
          </motion.div>

          <motion.div variants={itemVariants} style={{ ...styles.socialContainer, marginBottom: '0' }}>
            <button style={styles.socialBtn}><Chrome size={20} style={{ marginRight: '10px' }} /> Google</button>
            <button style={styles.socialBtn}><Linkedin size={20} style={{ color: '#0077b5', marginRight: '10px' }} /> LinkedIn</button>
          </motion.div>

          <motion.div variants={itemVariants} style={styles.authFooter}>
            Don't have an account? <span style={styles.link} onClick={() => navigate('/register')}>Sign up for free</span>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            style={{ 
              marginTop: '2.5rem', padding: '1rem', backgroundColor: '#f1f5f9', 
              borderRadius: '12px', display: 'flex', gap: '12px', color: '#475569' 
            }}
          >
            <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              <strong>Pro Tip:</strong> Use your assigned Gmail to automatically redirect to your specific role's workspace.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
