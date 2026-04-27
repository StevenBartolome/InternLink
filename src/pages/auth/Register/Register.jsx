// src/pages/auth/Register/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, ArrowLeft, User, Building, 
  Phone, Mail, EyeOff, Check, ArrowRight, Info,
  ShieldCheck, Rocket, Zap, Globe, MapPin, Briefcase
} from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { supabase } from '../../../services/supabaseClient';

const Register = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Student specific
    studentId: '',
    schoolId: '',
    programId: '',
    // Company specific
    companyName: '',
    industry: '',
    address: '',
    website: ''
  });

  // DB Data
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: schoolsData, error: schoolsError } = await supabase.from('schools').select('*');
      const { data: programsData, error: programsError } = await supabase.from('programs').select('*');
      
      if (schoolsError) console.error('Error fetching schools:', schoolsError);
      if (programsError) console.error('Error fetching programs:', programsError);

      setSchools(schoolsData || []);
      setPrograms(programsData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.schoolId) {
      setFilteredPrograms(programs.filter(p => p.school_id === formData.schoolId));
    } else {
      setFilteredPrograms([]);
    }
  }, [formData.schoolId, programs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) return false;
      if (role === 'student') {
        if (!formData.studentId || !formData.schoolId || !formData.programId) return false;
      } else {
        if (!formData.companyName || !formData.industry || !formData.address) return false;
      }
    }
    if (step === 3) {
      if (!formData.password || formData.password !== formData.confirmPassword || formData.password.length < 6) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // 1. Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            contact_number: formData.phone
          }
        }
      });

      if (authError) throw authError;

      // 2. Role Specific Table Insertion
      if (role === 'student') {
        const { error: studentError } = await supabase.from('students').insert([{
          id: authData.user.id,
          student_id: formData.studentId,
          school_id: formData.schoolId,
          program_id: formData.programId,
          status: 'pending'
        }]);
        if (studentError) throw studentError;
      } else {
        const { error: companyError } = await supabase.from('companies').insert([{
          user_id: authData.user.id,
          company_name: formData.companyName,
          industry: formData.industry,
          address: formData.address,
          contact_person: fullName,
          phone: formData.phone,
          website: formData.website || null,
          status: 'pending_approval'
        }]);
        if (companyError) throw companyError;
      }

      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError(null);
    } else {
      setError("Please complete all required fields.");
    }
  };
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
      maxWidth: '560px',
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
      marginBottom: '1.25rem',
      position: 'relative',
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
      fontSize: '0.95rem',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 1rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '0.95rem',
      backgroundColor: '#f8fafc',
      outline: 'none',
      appearance: 'none',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      zIndex: 5,
    },
    btnContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: '2rem',
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
    errorMsg: {
      color: '#ef4444',
      fontSize: '0.85rem',
      marginTop: '0.5rem',
      fontWeight: 500,
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
        title="Registration Successful!" 
        message={role === 'student' ? "Your application is pending verification." : "Your company registration is awaiting admin approval."} 
      />

      <div style={styles.brandSide}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ ...styles.floatingShape, width: '400px', height: '400px', top: '-10%', left: '-10%' }} 
        />
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}><GraduationCap size={26} /></div>
          <span style={{ color: '#fff' }}>InternLink</span>
        </div>
        <div style={styles.brandContent}>
          <h1 style={styles.brandTitle}>Build your <span style={{ color: '#fbbf24' }}>Future</span> with us.</h1>
          <p style={styles.brandP}>The ultimate bridge between talented students and industry-leading companies.</p>
        </div>
        <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>&copy; {new Date().getFullYear()} InternLink.</div>
      </div>

      <div style={styles.formSide}>
        <div style={{ padding: '2rem 4rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Sign up as a {role}</p>
          </div>

          <div style={styles.stepIndicator}>
            <div style={styles.progressLine} />
            <div style={styles.progressBar(step === 1 ? 0 : step === 2 ? 50 : 100)} />
            <div style={styles.stepItem(step === 1, step > 1)}>{step > 1 ? <Check size={18} /> : 1}</div>
            <div style={styles.stepItem(step === 2, step > 2)}>{step > 2 ? <Check size={18} /> : 2}</div>
            <div style={styles.stepItem(step === 3, false)}>3</div>
          </div>

          {error && <div style={{ ...styles.errorMsg, backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <label style={styles.label}>Choose account type</label>
                <div style={styles.roleSelector}>
                  <div style={styles.roleCard(role === 'student')} onClick={() => setRole('student')}>
                    <GraduationCap size={40} color={role === 'student' ? theme.colors.primary : '#64748b'} />
                    <span style={{ fontWeight: 700 }}>Student</span>
                  </div>
                  <div style={styles.roleCard(role === 'company')} onClick={() => setRole('company')}>
                    <Building size={40} color={role === 'company' ? theme.colors.primary : '#64748b'} />
                    <span style={{ fontWeight: 700 }}>Company</span>
                  </div>
                </div>
                <button style={styles.btnPrimary} onClick={nextStep}>Continue <ArrowRight size={20} /></button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>First Name</label>
                    <User size={18} style={styles.inputIcon} />
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} style={styles.input} placeholder="John" />
                  </div>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Last Name</label>
                    <User size={18} style={styles.inputIcon} />
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} style={styles.input} placeholder="Doe" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Email</label>
                    <Mail size={18} style={styles.inputIcon} />
                    <input name="email" value={formData.email} onChange={handleInputChange} style={styles.input} placeholder="name@email.com" />
                  </div>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Phone</label>
                    <Phone size={18} style={styles.inputIcon} />
                    <input name="phone" value={formData.phone} onChange={handleInputChange} style={styles.input} placeholder="+63..." />
                  </div>
                </div>

                {role === 'student' ? (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Student ID</label>
                      <Info size={18} style={styles.inputIcon} />
                      <input name="studentId" value={formData.studentId} onChange={handleInputChange} style={styles.input} placeholder="2021-00001" />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <label style={styles.label}>School</label>
                        <select name="schoolId" value={formData.schoolId} onChange={handleInputChange} style={styles.select}>
                          <option value="">Select School</option>
                          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <label style={styles.label}>Program</label>
                        <select name="programId" value={formData.programId} onChange={handleInputChange} style={styles.select} disabled={!formData.schoolId}>
                          <option value="">Select Program</option>
                          {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Company Name</label>
                      <Building size={18} style={styles.inputIcon} />
                      <input name="companyName" value={formData.companyName} onChange={handleInputChange} style={styles.input} placeholder="Acme Corp" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Industry</label>
                      <Briefcase size={18} style={styles.inputIcon} />
                      <input name="industry" value={formData.industry} onChange={handleInputChange} style={styles.input} placeholder="Tech, Finance, etc." />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Office Address</label>
                      <MapPin size={18} style={styles.inputIcon} />
                      <input name="address" value={formData.address} onChange={handleInputChange} style={styles.input} placeholder="Street, City" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Website (Optional)</label>
                      <Globe size={18} style={styles.inputIcon} />
                      <input name="website" value={formData.website} onChange={handleInputChange} style={styles.input} placeholder="https://..." />
                    </div>
                  </>
                )}

                <div style={styles.btnContainer}>
                  <button style={styles.btnSecondary} onClick={prevStep}>Back</button>
                  <button style={styles.btnPrimary} onClick={nextStep}>Next Step <ArrowRight size={20} /></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <EyeOff size={18} style={styles.inputIcon} />
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={styles.input} placeholder="••••••••" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <EyeOff size={18} style={styles.inputIcon} />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} style={styles.input} placeholder="••••••••" />
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', marginTop: '2rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>By registering, you agree to our Terms and Privacy Policy.</p>
                </div>

                <div style={styles.btnContainer}>
                  <button style={styles.btnSecondary} onClick={prevStep} disabled={loading}>Back</button>
                  <button style={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Processing...' : 'Complete Registration'} <Zap size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;
