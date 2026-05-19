import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Briefcase } from 'lucide-react';
import { theme } from '../../styles/theme';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '123') {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.gradients.dark,
      padding: '24px',
    },
    card: {
      backgroundColor: theme.colors.white,
      padding: '40px',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    roleBadge: {
      color: theme.colors.primary,
      fontSize: '0.9rem',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 700,
      margin: '0 0 8px 0',
    },
    subtext: {
      fontSize: '0.9rem',
      color: theme.colors.textMuted,
    },
    error: {
      backgroundColor: '#FDE8E8',
      color: theme.colors.danger,
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      marginBottom: '20px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    inputWrapper: {
      position: 'relative',
    },
    icon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.colors.textMuted,
    },
    input: {
      width: '100%',
      padding: '12px 14px 12px 42px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '0.95rem',
      outline: 'none',
    },
    submit: {
      backgroundColor: theme.colors.primary,
      color: '#fff',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '12px',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <Briefcase size={32} color={theme.colors.primary} />
            <span style={styles.logoText}>InternLink <span style={styles.roleBadge}>Admin</span></span>
          </div>
          <h2 style={styles.title}>System Administrator Access</h2>
          <p style={styles.subtext}>Enter your credentials to manage the OJT program.</p>
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.icon} />
              <input 
                style={styles.input}
                type="email" 
                placeholder="admin@gmail.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.icon} />
              <input 
                style={styles.input}
                type="password" 
                placeholder="123" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" style={styles.submit}>
            Log In to Console
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.8rem', color: theme.colors.textMuted }}>
          Protected System. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
