// src/pages/auth/ForgotPassword/ForgotPassword.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { supabase } from '../../../services/supabaseClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const inputRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: finalOtp,
        type: 'recovery'
      });
      if (verifyError) throw verifyError;
      
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid recovery code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
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
      boxSizing: 'border-box'
    },
    otpContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '8px',
      marginBottom: '0.5rem'
    },
    otpInput: {
      width: '45px',
      height: '55px',
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: 700,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      backgroundColor: '#F8FAFC',
      color: theme.colors.textMain,
      transition: 'all 0.2s ease',
      outline: 'none'
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
      opacity: loading ? 0.7 : 1
    }),
    btnBack: (isHovered) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
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
          {step === 1 && (
            <>
              <h1 style={styles.title}>Forgot Password?</h1>
              <p style={styles.subtitle}>
                No worries, we'll send you a recovery code to your email.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 style={styles.title}>Enter Recovery Code</h1>
              <p style={styles.subtitle}>
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 style={styles.title}>Create New Password</h1>
              <p style={styles.subtitle}>
                Your code has been verified. Please enter a new password.
              </p>
            </>
          )}
          {step === 4 && (
            <div style={styles.successState}>
              <CheckCircle size={64} style={styles.successIcon} />
              <h1 style={styles.title}>Password Reset!</h1>
              <p style={styles.subtitle}>
                Your password has been changed successfully.
              </p>
            </div>
          )}
        </div>

        {step === 1 && (
          <form style={styles.form} onSubmit={handleSendOtp}>
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
              style={styles.btnSubmit(hoveredBtn === 'send')}
              onMouseEnter={() => setHoveredBtn('send')}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Recovery Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form style={styles.form} onSubmit={handleVerifyOtp}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>6-Digit Recovery Code</label>
              <div style={styles.otpContainer} onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                    style={styles.otpInput}
                    required
                  />
                ))}
              </div>
              {error && (
                <p style={{ color: theme.colors.danger, fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              style={styles.btnSubmit(hoveredBtn === 'verify')}
              onMouseEnter={() => setHoveredBtn('verify')}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form style={styles.form} onSubmit={handleUpdatePassword}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  style={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}

        {step === 4 && (
          <button 
            style={styles.btnSubmit(hoveredBtn === 'login')}
            onMouseEnter={() => setHoveredBtn('login')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        )}

        {step !== 4 && (
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
