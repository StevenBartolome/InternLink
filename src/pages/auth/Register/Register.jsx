// src/pages/auth/Register/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, ArrowLeft, User, Building, 
  Phone, Mail, EyeOff, Check, ArrowRight, Info,
  ShieldCheck, Rocket, Zap
} from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

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
      backgroundColor: '#f8fafc',
    },
    brandSide: {
      flex: 1,
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
      fontWeight: '800',
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
    },
    formSide: {
      flex: 1.2,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowY: 'auto',
      zIndex: 20,
      boxShadow: '-10px 0 30px rgba(0,0,0,0.02)',
    },
    formContainer: {
      maxWidth: '520px',
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
      marginBottom: '0.5rem',
      fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1rem',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '3rem',
      position: 'relative',
      padding: '0 10px',
    },
    progressLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: '#e2e8f0',
      zIndex: 1,
      transform: 'translateY(-50%)',
    },
    progressBar: (progress) => ({
      position: 'absolute',
      top: '50%',
      left: 0,
      width: `${progress}%`,
      height: '2px',
      backgroundColor: theme.colors.primary,
      zIndex: 2,
      transform: 'translateY(-50%)',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    stepItem: (active, completed) => ({
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: completed ? theme.colors.primary : active ? '#fff' : '#fff',
      border: `2px solid ${completed || active ? theme.colors.primary : '#e2e8f0'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '0.9rem',
      color: completed ? '#fff' : active ? theme.colors.primary : '#94a3b8',
      zIndex: 3,
      position: 'relative',
      boxShadow: active ? `0 0 0 4px rgba(30, 58, 138, 0.1)` : 'none',
      transition: 'all 0.3s ease',
    }),
    roleSelector: {
      display: 'flex',
      gap: '1.25rem',
      marginBottom: '2rem',
    },
    roleCard: (active) => ({
      flex: 1,
      padding: '1.5rem',
      borderRadius: '16px',
      border: `2px solid ${active ? theme.colors.primary : '#e2e8f0'}`,
      backgroundColor: active ? '#f0f4ff' : '#fff',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s ease',
    }),
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
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 2.8rem',
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
    btnContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: '2.5rem',
    },
    btnPrimary: {
      flex: 1.5,
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
      gap: '8px',
      transition: '0.2s',
    },
    btnSecondary: {
      flex: 1,
      padding: '1rem',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      color: '#64748b',
      borderRadius: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s',
    },
    authFooter: {
      marginTop: '1rem',
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

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div style={styles.authSplit}>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/login');
        }} 
        title="Account Created!" 
        message="Your professional profile is ready. You can now log into the portal." 
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
            Empowering the <br />
            <span style={{ color: '#fbbf24' }}>Next Generation</span> <br />
            of Talent.
          </h1>
          <p style={styles.brandP}>
            Join thousands of students and companies building the 
            future of work through meaningful internship connections.
          </p>
          
          <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                <Rocket size={24} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Fast-Track Growth</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Accelerate your career path</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Verified Partners</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Secure and trusted placements</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ opacity: 0.5, fontSize: '0.85rem', zIndex: 10 }}>
          &copy; {new Date().getFullYear()} InternLink. Build your legacy.
        </div>
      </div>

      {/* Form Side */}
      <div style={styles.formSide}>
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
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Let's get your professional journey started</p>
          </div>

          <div style={styles.stepIndicator}>
            <div style={styles.progressLine} />
            <div style={styles.progressBar(step === 1 ? 0 : step === 2 ? 50 : 100)} />
            <div style={styles.stepItem(step === 1, step > 1)}>{step > 1 ? <Check size={18} /> : 1}</div>
            <div style={styles.stepItem(step === 2, step > 2)}>{step > 2 ? <Check size={18} /> : 2}</div>
            <div style={styles.stepItem(step === 3, false)}>3</div>
          </div>

          <div style={{ minHeight: '330px', display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <label style={styles.label}>Choose your account type</label>
                  <div style={styles.roleSelector}>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={styles.roleCard(role === 'student')}
                      onClick={() => setRole('student')}
                    >
                      <div style={{ color: role === 'student' ? theme.colors.primary : '#64748b' }}>
                        <GraduationCap size={40} />
                      </div>
                      <span style={{ fontWeight: 700 }}>Student</span>
                      <p style={{ fontSize: '0.75rem', textAlign: 'center', opacity: 0.7, margin: 0 }}>Discover and apply for internships</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={styles.roleCard(role === 'employer')}
                      onClick={() => setRole('employer')}
                    >
                      <div style={{ color: role === 'employer' ? theme.colors.primary : '#64748b' }}>
                        <Building size={40} />
                      </div>
                      <span style={{ fontWeight: 700 }}>Employer</span>
                      <p style={{ fontSize: '0.75rem', textAlign: 'center', opacity: 0.7, margin: 0 }}>Find and hire the best talent</p>
                    </motion.div>
                  </div>

                  <div style={styles.btnContainer}>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={styles.btnPrimary} 
                      onClick={nextStep}
                    >
                      Continue <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ ...styles.formGroup, flex: 1 }}>
                      <label style={styles.label}>First Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={styles.inputIcon} />
                        <input type="text" placeholder="John" style={styles.input} required />
                      </div>
                    </div>
                    <div style={{ ...styles.formGroup, flex: 1 }}>
                      <label style={styles.label}>Last Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={styles.inputIcon} />
                        <input type="text" placeholder="Doe" style={styles.input} required />
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={styles.inputIcon} />
                      <input type="email" placeholder="name@example.com" style={styles.input} required />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={styles.inputIcon} />
                      <input type="tel" placeholder="+1 (555) 000-0000" style={styles.input} required />
                    </div>
                  </div>

                  <div style={styles.btnContainer}>
                    <button style={styles.btnSecondary} onClick={prevStep}>Back</button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={styles.btnPrimary} 
                      onClick={nextStep}
                    >
                      Next Step <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Create Password</label>
                    <div style={{ position: 'relative' }}>
                      <EyeOff size={18} style={styles.inputIcon} />
                      <input type="password" placeholder="••••••••••••" style={styles.input} required />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <EyeOff size={18} style={styles.inputIcon} />
                      <input type="password" placeholder="••••••••••••" style={styles.input} required />
                    </div>
                  </div>

                  <div style={{ 
                    padding: '1.25rem', backgroundColor: '#f8fafc', 
                    borderRadius: '12px', border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${theme.colors.primary}`,
                    marginTop: '2rem'
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <ShieldCheck size={18} style={{ color: theme.colors.primary }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Safety First</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      By clicking Register, you agree to our Terms of Service and Privacy Policy. 
                      Your account will need to be verified by school coordinators.
                    </p>
                  </div>

                  <div style={styles.btnContainer}>
                    <button style={styles.btnSecondary} onClick={prevStep}>Back</button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={styles.btnPrimary} 
                      onClick={handleSubmit}
                    >
                      Complete Registration <Zap size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={styles.authFooter}
          >
            Already have an account? <span style={styles.link} onClick={() => navigate('/login')}>Sign in</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
