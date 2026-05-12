// src/pages/auth/Login/Login.jsx — Role-based login with redirect
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Mail, EyeOff, Eye, ArrowRight, Info, Users } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAuth } from '../../../context/AuthContext';


const ROLE_REDIRECTS = {
  student: '/dashboard',
  ojt_head: '/ojt-professor/dashboard',
  admin: '/admin/dashboard',
};
const Login = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(ROLE_REDIRECTS[user.role] || '/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Safety timeout: if login takes more than 10s, release the loading state
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Login is taking longer than expected. Please check your connection or try again.');
      }
    }, 10000);

    try {
      console.log('Login form submitted for:', email);
      const result = await login(email, password);
      clearTimeout(timeout);
      
      console.log('Login result:', result.success ? 'Success' : 'Failed', result.error || '');

      if (!result.success) {
        setLoading(false);
        if (result.error.toLowerCase().includes('email not confirmed')) {
          setError('Please check your inbox and verify your email before signing in.');
        } else {
          setError(result.error);
        }
      } else {
        // Navigate based on role (Students go to welcome, others to dashboard)
        const target = ROLE_REDIRECTS[result.user.role] || '/dashboard';
        console.log('Navigating to:', target, 'Role:', result.user.role);
        navigate(target);
        // Note: we don't setLoading(false) here to prevent flicker before navigation
      }
    } catch (err) {
      clearTimeout(timeout);
      setLoading(false);
      setError('An unexpected error occurred during sign in.');
      console.error('Submit error:', err);
    }
  };



  const s = {
    page: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc' },
    brand: {
      flex: 1.2, position: 'relative',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1e3a8a 100%)`,
      padding: '4rem', display: isMobile ? 'none' : 'flex',
      flexDirection: 'column', justifyContent: 'space-between', color: '#fff', overflow: 'hidden',
    },
    shape: { position: 'absolute', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)', zIndex: 1 },
    formSide: { flex: 1, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.02)', overflowY: 'auto' },
    inner: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '440px', width: '100%', margin: '0 auto', padding: isMobile ? '2rem' : '4rem 2rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' },
    inputWrap: { position: 'relative', marginBottom: '1.25rem' },
    input: { width: '100%', padding: '0.875rem 1rem 0.875rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    icon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    btn: { width: '100%', padding: '1rem', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' },
    demoBtn: (color) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${color}20`, backgroundColor: `${color}08`, color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }),
  };

  const itemV = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
  const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

  return (
    <div style={s.page}>
      {/* Brand */}
      <div style={s.brand}>
        <motion.div animate={{ scale: [1,1.2,1], rotate: [0,90,0] }} transition={{ duration: 20, repeat: Infinity }} style={{ ...s.shape, width: '400px', height: '400px', top: '-10%', left: '-10%' }} />
        <motion.div animate={{ scale: [1,1.3,1], rotate: [0,-90,0] }} transition={{ duration: 25, repeat: Infinity }} style={{ ...s.shape, width: '300px', height: '300px', bottom: '10%', right: '-5%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 800, zIndex: 10 }}>
          <div style={{ backgroundColor: '#fbbf24', color: theme.colors.primary, width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={26} />
          </div>
          <span style={{ color: '#fff' }}>InternLink</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ maxWidth: '460px', zIndex: 10 }}>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            OJT Internship<br /><span style={{ color: '#fbbf24' }}>Management</span><br />System
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7, fontSize: '1rem' }}>
            A unified platform for students, OJT Heads, and Administrators to manage the complete internship journey — from pre-deployment to final grading.
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '2.5rem' }}>
            {[{ v: '3', l: 'Stages' }, { v: '3', l: 'Roles' }, { v: '100%', l: 'COR-Verified' }].map(x => (
              <div key={x.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{x.v}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <div style={{ opacity: 0.4, fontSize: '0.85rem', zIndex: 10 }}>© {new Date().getFullYear()} InternLink</div>
      </div>

      {/* Form side */}
      <div style={s.formSide}>
        <div style={{ padding: '2rem 4rem' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <motion.div initial="hidden" animate="visible" variants={containerV} style={s.inner}>
          <motion.div variants={itemV}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.75rem' }}>Sign in to your InternLink portal</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Info size={18} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemV}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrap}>
                <Mail size={18} style={s.icon} />
                <input type="email" placeholder="your@email.com" style={s.input} value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={e => e.target.style.borderColor = theme.colors.primary}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} required />
              </div>
            </motion.div>

            <motion.div variants={itemV}>
              <label style={s.label}>Password</label>
              <div style={{ ...s.inputWrap, position: 'relative' }}>
                <EyeOff size={18} style={s.icon} />
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" style={{ ...s.input, paddingRight: '2.5rem' }} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={e => e.target.style.borderColor = theme.colors.primary}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} required />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                <span onClick={() => navigate('/forgot-password')} style={{ fontSize: '0.85rem', color: theme.colors.primary, fontWeight: 700, cursor: 'pointer' }}>Forgot password?</span>
              </div>
            </motion.div>

            <motion.button variants={itemV} whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(30,58,138,0.3)' }} whileTap={{ scale: 0.98 }}
              type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Signing in...' : <> Sign In <ArrowRight size={20} /></>}
            </motion.button>
          </form>

          <motion.div variants={itemV} style={{ marginTop: '2rem', padding: '14px 16px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', gap: '12px', color: '#475569' }}>
            <Users size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              <strong>One portal for all roles.</strong> The system automatically detects whether you are a Student, OJT Head, or Admin and redirects you to the correct dashboard.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
