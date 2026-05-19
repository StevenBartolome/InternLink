import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { theme } from '../../../styles/theme';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../components/common/Toast';

export default function SetupAccount() {
  const { user, updateUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  
  // Redirect away if already setup
  React.useEffect(() => {
    if (user && user.is_first_login === false) {
      const role = user.role;
      const target = role === 'admin' ? '/admin/dashboard' : role === 'ojt_head' ? '/ojt-professor/dashboard' : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      // 1. Update Password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({ 
        password
      });
      if (authError) throw authError;

      // 2. Clear first login flag in both DB and AuthContext state
      const { error: profileError } = await updateUser({ is_first_login: false });
      if (profileError) throw profileError;

      setToast({ message: 'Account activated! Redirecting to dashboard...', type: 'success' });
      
      // 3. Navigate to appropriate dashboard
      setTimeout(() => {
        const role = user?.role;
        const target = role === 'admin' ? '/admin/dashboard' : role === 'ojt_head' ? '/ojt-professor/dashboard' : '/dashboard';
        navigate(target);
      }, 1500);
      
    } catch (err) {
      console.error('Setup error:', err);
      setToast({ message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  const s = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '440px',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: '#0f172a',
      marginBottom: '8px',
      fontFamily: "'Outfit', sans-serif",
    },
    sub: {
      color: '#64748b',
      fontSize: '0.95rem',
      marginBottom: '32px',
    },
    inputGroup: {
      textAlign: 'left',
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#475569',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box',
    },
    btn: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      backgroundColor: '#1e40af',
      color: '#fff',
      border: 'none',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '10px',
    }
  };


  return (
    <div style={s.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={s.card}>
        <div style={{ backgroundColor: '#eff6ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <ShieldCheck size={40} color="#1e40af" />
        </div>
        <h2 style={s.title}>Setup Your Account</h2>
        <p style={s.sub}>Please create a secure password to activate your professor account.</p>

        <form onSubmit={handleSetup}>
          <div style={s.inputGroup}>
            <label style={s.label}>New Password</label>
            <input 
              type="password" 
              style={s.input} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Confirm Password</label>
            <input 
              type="password" 
              style={s.input} 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" disabled={loading} style={s.btn}>
            <Lock size={18} /> {loading ? 'Saving...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
