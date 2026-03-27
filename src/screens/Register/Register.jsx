// src/screens/Register/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft, 
  User, 
  Building, 
  Phone, 
  Mail, 
  EyeOff, 
  Check, 
  ArrowRight,
  Info 
} from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Register = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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
      maxWidth: '500px',
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
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '2.5rem',
      position: 'relative',
    },
    indicatorLine: {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: theme.colors.border,
      zIndex: 1,
      transform: 'translateY(-50%)',
    },
    stepItem: (active, completed) => ({
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: completed ? '#EAB308' : active ? theme.colors.primary : '#F8FAFC',
      border: `2px solid ${completed ? '#EAB308' : active ? theme.colors.primary : theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '0.85rem',
      color: completed ? '#000' : active ? theme.colors.white : theme.colors.textMuted,
      zIndex: 2,
      position: 'relative',
      transition: 'all 0.3s ease',
    }),
    roleSelector: {
      display: 'flex',
      gap: '1rem',
      margin: '1rem 0',
    },
    btnRole: (active) => ({
      flex: 1,
      padding: '1.5rem 1rem',
      backgroundColor: active ? '#EFF6FF' : '#F8FAFC',
      border: `2px solid ${active ? theme.colors.primary : theme.colors.border}`,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      color: active ? theme.colors.primary : theme.colors.textMuted,
      transition: 'all 0.2s ease',
    }),
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
    formRow: {
      display: 'flex',
      gap: '1rem',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    },
    wizardActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
    },
    btnPrimary: (isHovered) => ({
      flex: 2,
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
      gap: '8px',
      boxShadow: isHovered ? theme.shadows.md : theme.shadows.sm,
      transform: isHovered ? 'translateY(-1px)' : 'none',
      order: 1,
    }),
    btnSecondary: {
      flex: 1,
      padding: '0.875rem',
      backgroundColor: '#F8FAFC',
      border: `1px solid ${theme.colors.border}`,
      color: theme.colors.textMuted,
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmationCard: {
      backgroundColor: '#F8FAFC',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '1.25rem',
      margin: '1.5rem 0',
      borderLeft: `4px solid #EAB308`,
    },
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
    }
  };

  return (
    <div style={styles.authSplit}>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/login');
        }} 
        title="Registration Successful" 
        message="Your account has been created! You can now login using your credentials." 
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
          &copy; {new Date().getFullYear()} InternLink. All rights reserved.
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
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Step {step} of 3: {step === 1 ? 'Choose Role' : step === 2 ? 'Account Info' : 'Security'}</p>
          </div>

          <div style={styles.stepIndicator}>
            <div style={styles.indicatorLine}></div>
            <div style={styles.stepItem(step >= 1, step > 1)}>{step > 1 ? <Check size={16} /> : 1}</div>
            <div style={styles.stepItem(step >= 2, step > 2)}>{step > 2 ? <Check size={16} /> : 2}</div>
            <div style={styles.stepItem(step >= 3, false)}>3</div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>I am registering as a:</label>
                  <div style={styles.roleSelector}>
                    <button 
                      type="button" 
                      style={styles.btnRole(role === 'student')}
                      onClick={() => setRole('student')}
                    >
                      <GraduationCap size={28} />
                      <span>Student</span>
                    </button>
                    <button 
                      type="button" 
                      style={styles.btnRole(role === 'employer')}
                      onClick={() => setRole('employer')}
                    >
                      <Building size={28} />
                      <span>Employer</span>
                    </button>
                  </div>
                </div>
                <button 
                  type="button" 
                  style={styles.btnPrimary(hoveredBtn === 'next')}
                  onMouseEnter={() => setHoveredBtn('next')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={nextStep}
                >
                  Next <ArrowRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={styles.formRow}>
                  <div style={{...styles.formGroup, flex: 1}}>
                    <label style={styles.label} htmlFor="firstName">First Name</label>
                    <div style={styles.inputWrapper}>
                      <input style={styles.input} type="text" id="firstName" placeholder="John" required />
                      <User size={18} style={styles.inputIcon} />
                    </div>
                  </div>
                  <div style={{...styles.formGroup, flex: 1}}>
                    <label style={styles.label} htmlFor="lastName">Last Name</label>
                    <div style={styles.inputWrapper}>
                      <input style={styles.input} type="text" id="lastName" placeholder="Doe" required />
                      <User size={18} style={styles.inputIcon} />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="phone">Phone Number</label>
                  <div style={styles.inputWrapper}>
                    <input style={styles.input} type="tel" id="phone" placeholder="+63 912 345 6789" required />
                    <Phone size={18} style={styles.inputIcon} />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="email">Email Address</label>
                  <div style={styles.inputWrapper}>
                    <input style={styles.input} type="email" id="email" placeholder="you@example.com" required />
                    <Mail size={18} style={styles.inputIcon} />
                  </div>
                </div>

                <div style={styles.wizardActions}>
                  <button 
                    type="button" 
                    style={styles.btnPrimary(hoveredBtn === 'next')}
                    onMouseEnter={() => setHoveredBtn('next')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={nextStep}
                  >
                    Next Step
                  </button>
                  <button type="button" style={styles.btnSecondary} onClick={prevStep}>Back</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="password">Create Password</label>
                  <div style={styles.inputWrapper}>
                    <input style={styles.input} type="password" id="password" placeholder="••••••••••••" required />
                    <EyeOff size={18} style={styles.inputIcon} />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                  <div style={styles.inputWrapper}>
                    <input style={styles.input} type="password" id="confirmPassword" placeholder="••••••••••••" required />
                    <EyeOff size={18} style={styles.inputIcon} />
                  </div>
                </div>

                <div style={styles.confirmationCard}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Account Summary</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: theme.colors.textMain }}>
                    <strong>Role:</strong> {role === 'student' ? '🎓 Student' : '🏢 Employer'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>
                    You can configure your complete profile, add skills, and set preferences after verification.
                  </p>
                </div>

                <div style={styles.wizardActions}>
                  <button 
                    type="submit" 
                    style={styles.btnPrimary(hoveredBtn === 'register')}
                    onMouseEnter={() => setHoveredBtn('register')}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    Finish & Register
                  </button>
                  <button type="button" style={styles.btnSecondary} onClick={prevStep}>Back</button>
                </div>
              </div>
            )}
          </form>

          <p style={styles.authSwitch}>
            Already have an account? <span style={styles.switchLink} onClick={() => navigate('/login')}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
