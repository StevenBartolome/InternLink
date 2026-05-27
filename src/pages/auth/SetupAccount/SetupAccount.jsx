import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Loader2, User, Phone, Users } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { theme } from '../../../styles/theme';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../components/common/Toast';

export default function SetupAccount() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Step 2 profile details for students
  const [pronounSubject, setPronounSubject] = useState('her');
  const [parentName, setParentName] = useState('');
  const [parentRelationship, setParentRelationship] = useState('Mother');
  const [parentContact, setParentContact] = useState('');
  const [witnessName, setWitnessName] = useState('Prof. Steven Bartolome');
  
  // Redirect away if already setup
  React.useEffect(() => {
    if (user && user.is_first_login === false) {
      const role = user.role;
      const target = role === 'admin' ? '/admin/dashboard' : role === 'ojt_head' ? '/ojt-professor/dashboard' : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (user?.role === 'student') {
      setStep(2);
    } else {
      handleSetup(null);
    }
  };

  const handleSetup = async (e) => {
    if (e) e.preventDefault();
    
    // Quick validation for student details if in step 2
    if (user?.role === 'student' && step === 2) {
      if (!parentName.trim()) {
        setToast({ message: 'Parent / Guardian Name is required', type: 'warning' });
        return;
      }
      if (!parentContact.trim()) {
        setToast({ message: 'Parent Contact Number is required', type: 'warning' });
        return;
      }
    }

    try {
      setLoading(true);
      
      // 1. Update Password and Student Defaults in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({ 
        password,
        data: user?.role === 'student' ? {
          pronoun_subject: pronounSubject,
          parent_name: parentName,
          parent_relationship: parentRelationship,
          parent_contact: parentContact,
          witness_name: witnessName
        } : {}
      });
      if (authError) throw authError;

      // 2. Clear first login flag in both DB and AuthContext state
      const { error: profileError } = await updateUser({ is_first_login: false });
      if (profileError) throw profileError;

      setToast({ message: '✨ Account activated successfully! Redirecting...', type: 'success' });
      
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
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
      width: '100%',
      maxWidth: step === 1 ? '440px' : '520px',
      textAlign: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
      marginBottom: '28px',
    },
    inputGroup: {
      textAlign: 'left',
      marginBottom: '18px',
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
      backgroundColor: '#f8fafc',
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      outline: 'none',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      cursor: 'pointer',
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
      boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
    },
    btnSecondary: {
      padding: '14px',
      borderRadius: '12px',
      backgroundColor: '#fff',
      color: '#475569',
      border: '1px solid #e2e8f0',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      flex: 1,
    },
    btnPrimary: {
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
      flex: 2,
      boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    progressStep: {
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#1e40af',
      marginBottom: '4px',
      display: 'block'
    }
  };

  return (
    <div style={s.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={s.card}>
        <div style={{ backgroundColor: '#eff6ff', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldCheck size={36} color="#1e40af" />
        </div>
        
        {user?.role === 'student' && (
          <span style={s.progressStep}>Step {step} of 2</span>
        )}
        
        <h2 style={s.title}>
          {step === 1 ? 'Setup Your Account' : 'Profile & Parent Details'}
        </h2>
        <p style={s.sub}>
          {step === 1 
            ? `Please create a secure password to activate your ${user?.role === 'student' ? 'student' : 'professor'} account.`
            : 'Set your parent/guardian details and pronouns to auto-fill pre-internship documents.'}
        </p>

        {/* STEP 1: PASSWORD FORM */}
        {step === 1 && (
          <form onSubmit={handleNextStep}>
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
            <button type="submit" style={s.btn}>
              {user?.role === 'student' ? 'Next Step' : 'Activate Account'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: PROFILE & PARENT DETAILS (STUDENT ONLY) */}
        {step === 2 && (
          <form onSubmit={handleSetup}>
            <div style={s.row}>
              <div style={s.inputGroup}>
                <label style={s.label}>Pronouns (Subject)</label>
                <select 
                  style={s.select}
                  value={pronounSubject}
                  onChange={(e) => setPronounSubject(e.target.value)}
                >
                  <option value="her">Female (her/she)</option>
                  <option value="him">Male (him/he)</option>
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Witness Name</label>
                <input 
                  type="text"
                  style={s.input} 
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  placeholder="e.g. Prof. Steven Bartolome"
                />
              </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Parent / Guardian Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                style={s.input} 
                placeholder="e.g. Maria Clara G. Ortiz" 
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required 
              />
            </div>

            <div style={s.row}>
              <div style={s.inputGroup}>
                <label style={s.label}>Relationship <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  style={s.input} 
                  placeholder="e.g. Mother / Father" 
                  value={parentRelationship}
                  onChange={(e) => setParentRelationship(e.target.value)}
                  required 
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Parent Contact No. <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  style={s.input} 
                  placeholder="e.g. 09171234567" 
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                type="button" 
                style={s.btnSecondary} 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                type="submit" 
                style={s.btnPrimary}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>Activate Account <CheckCircle size={18} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
