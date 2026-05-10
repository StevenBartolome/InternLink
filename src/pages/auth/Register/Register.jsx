// src/pages/auth/Register/Register.jsx — COR-based student registration with Gemini AI
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, ArrowLeft, Upload, CheckCircle, XCircle,
  AlertTriangle, Mail, Eye, EyeOff, ArrowRight, Loader,
  FileText, Lock, User, BookOpen, Sparkles
} from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useAuth } from '../../../context/AuthContext';
import { scanCORWithGemini } from '../../../services/geminiCORScanner';

const STEPS = ['Upload COR', 'Verify Details', 'Set Credentials'];

export default function Register() {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | success | failed | ineligible
  const [corFile, setCorFile] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [scanError, setScanError] = useState('');

  const [credentials, setCredentials] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [credError, setCredError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── COR Upload & Scan ────────────────────────────────────────────
  const handleFileDrop = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setScanError('Please upload a PDF file.');
      return;
    }
    setCorFile(file);
    setScanState('scanning');
    setScanError('');

    const result = await scanCORWithGemini(file);

    if (!result.success) {
      setScanState('failed');
      setScanError(result.error || 'Could not read the PDF. Please try again.');
      return;
    }

    if (!result.eligible) {
      setScanState('ineligible');
      setScanError(`No OJT/Practicum subject found in your COR. You must be enrolled in an OJT subject to register.`);
      return;
    }

    setScannedData(result.data);
    setScanState('success');
    setTimeout(() => setStep(1), 800);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileDrop(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileDrop(e.dataTransfer.files[0]);
  };

  // ─── Credentials & Submit ─────────────────────────────────────────
  const handleSubmit = async () => {
    setCredError('');
    if (!credentials.email.includes('@')) return setCredError('Please enter a valid email address.');
    if (credentials.password.length < 6) return setCredError('Password must be at least 6 characters.');
    if (credentials.password !== credentials.confirmPassword) return setCredError('Passwords do not match.');

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    registerStudent({ ...scannedData, email: credentials.email });
    navigate('/dashboard');
  };

  // ─── Styles ──────────────────────────────────────────────────────
  const s = {
    page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
    brand: {
      flex: 1, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      padding: '4rem', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', color: '#fff',
      '@media(max-width:900px)': { display: 'none' },
    },
    form: {
      flex: 1.3, backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
      overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.03)',
    },
    inner: { maxWidth: '520px', width: '100%', margin: '0 auto', padding: '3rem 2rem' },
    stepBar: { display: 'flex', gap: '8px', marginBottom: '2.5rem' },
    stepDot: (active, done) => ({
      flex: 1, height: '4px', borderRadius: '4px',
      backgroundColor: done ? '#2563eb' : active ? '#93c5fd' : '#e2e8f0',
      transition: 'background-color 0.3s',
    }),
    title: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif" },
    sub: { color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' },
    dropZone: (drag, state) => ({
      border: `2px dashed ${drag ? '#2563eb' : state === 'failed' || state === 'ineligible' ? '#ef4444' : state === 'success' ? '#16a34a' : '#cbd5e1'}`,
      borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center',
      cursor: 'pointer', transition: 'all 0.3s',
      backgroundColor: drag ? '#eff6ff' : state === 'scanning' ? '#f0f9ff' : '#f8fafc',
    }),
    lockedField: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', borderRadius: '12px',
      border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
      marginBottom: '12px',
    },
    input: {
      width: '100%', padding: '13px 16px 13px 44px',
      borderRadius: '12px', border: '1px solid #e2e8f0',
      fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
      backgroundColor: '#f8fafc', transition: 'border-color 0.2s',
    },
    inputWrap: { position: 'relative', marginBottom: '14px' },
    inputIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    btn: {
      width: '100%', padding: '14px', borderRadius: '12px',
      backgroundColor: '#1e40af', color: '#fff', border: 'none',
      fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      transition: 'background-color 0.2s', marginTop: '8px',
    },
    error: { color: '#ef4444', fontSize: '0.85rem', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', marginTop: '12px' },
    badge: (color) => ({
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
      backgroundColor: color === 'green' ? '#dcfce7' : color === 'blue' ? '#dbeafe' : '#fef2f2',
      color: color === 'green' ? '#15803d' : color === 'blue' ? '#1d4ed8' : '#dc2626',
    }),
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div style={s.page}>
      {/* Brand side */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.4rem' }}>
          <div style={{ backgroundColor: '#fbbf24', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} color="#1e3a8a" />
          </div>
          InternLink
        </div>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            Your OJT Journey<br /><span style={{ color: '#fbbf24' }}>Starts Here</span>
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7, fontSize: '1.05rem' }}>
            Upload your Certificate of Registration. Our AI will scan it, verify your OJT enrollment, and set up your account automatically — no manual form filling.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '2.5rem' }}>
            {[
              { icon: <Sparkles size={18} />, text: 'AI-powered COR scanning via Google Gemini' },
              { icon: <Lock size={18} />, text: 'OJT eligibility verified automatically' },
              { icon: <CheckCircle size={18} />, text: 'Account ready instantly — no waiting' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.9 }}>
                <div style={{ color: '#fbbf24' }}>{item.icon}</div>
                <span style={{ fontSize: '0.9rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ opacity: 0.4, fontSize: '0.8rem' }}>© {new Date().getFullYear()} InternLink</div>
      </div>

      {/* Form side */}
      <div style={s.form}>
        <div style={{ padding: '1.5rem 2rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <ArrowLeft size={18} /> Back to Home
          </button>
        </div>

        <div style={s.inner}>
          {/* Step progress dots */}
          <div style={s.stepBar}>
            {STEPS.map((_, i) => <div key={i} style={s.stepDot(step === i, step > i)} />)}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 0: Upload COR ── */}
            {step === 0 && (
              <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 style={s.title}>Upload your COR</h2>
                <p style={s.sub}>Step 1 of 3 — Upload your Certificate of Registration (PDF). Our AI will scan it to verify your OJT enrollment.</p>

                <div
                  style={s.dropZone(isDragging, scanState)}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => scanState === 'idle' || scanState === 'failed' || scanState === 'ineligible' ? fileInputRef.current?.click() : null}
                >
                  <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileInput} />

                  {scanState === 'idle' && (
                    <>
                      <Upload size={40} color="#2563eb" style={{ marginBottom: '12px' }} />
                      <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', margin: '0 0 6px 0' }}>
                        Drop your COR PDF here
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>or click to browse — PDF only</p>
                    </>
                  )}

                  {scanState === 'scanning' && (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                        <Loader size={40} color="#2563eb" style={{ marginBottom: '12px' }} />
                      </motion.div>
                      <p style={{ fontWeight: 700, color: '#1e40af', margin: '0 0 4px 0' }}>Scanning your COR...</p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Gemini AI is reading {corFile?.name}</p>
                    </>
                  )}

                  {scanState === 'success' && (
                    <>
                      <CheckCircle size={40} color="#16a34a" style={{ marginBottom: '12px' }} />
                      <p style={{ fontWeight: 700, color: '#15803d', margin: '0 0 4px 0' }}>COR Scanned Successfully!</p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Redirecting to verification...</p>
                    </>
                  )}

                  {(scanState === 'failed' || scanState === 'ineligible') && (
                    <>
                      {scanState === 'ineligible' ? <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '12px' }} /> : <XCircle size={40} color="#ef4444" style={{ marginBottom: '12px' }} />}
                      <p style={{ fontWeight: 700, color: scanState === 'ineligible' ? '#92400e' : '#dc2626', margin: '0 0 8px 0' }}>
                        {scanState === 'ineligible' ? 'Not Eligible for OJT' : 'Scan Failed'}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px 0' }}>{scanError}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setScanState('idle'); setCorFile(null); setScanError(''); }}
                        style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        Try Another File
                      </button>
                    </>
                  )}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1.5rem' }}>
                  🔒 Your COR is processed securely. Only extracted text is sent to the AI — no file is stored.
                </p>
              </motion.div>
            )}

            {/* ── STEP 1: Verify Details ── */}
            {step === 1 && scannedData && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 style={s.title}>Verify your details</h2>
                <p style={s.sub}>Step 2 of 3 — These details were extracted from your COR and are locked. Contact your OJT Head if anything is incorrect.</p>

                <div style={{ marginBottom: '20px' }}>
                  <span style={s.badge('green')}>
                    <CheckCircle size={14} /> OJT Subject Found: {scannedData.ojtSubjectName}
                  </span>
                </div>

                {[
                  { label: 'Full Name', value: scannedData.studentName, icon: <User size={16} color="#94a3b8" /> },
                  { label: 'Student ID', value: scannedData.studentId, icon: <FileText size={16} color="#94a3b8" /> },
                  { label: 'Course', value: scannedData.course, icon: <BookOpen size={16} color="#94a3b8" /> },
                  { label: 'Year Level', value: scannedData.yearLevel, icon: <GraduationCap size={16} color="#94a3b8" /> },
                  { label: 'Academic Year', value: `${scannedData.academicYear} — ${scannedData.semester}`, icon: <FileText size={16} color="#94a3b8" /> },
                ].map(f => (
                  <div key={f.label} style={s.lockedField}>
                    {f.icon}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px', fontWeight: 600 }}>{f.label}</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{f.value || '—'}</div>
                    </div>
                    <Lock size={14} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                  </div>
                ))}

                <div style={{ marginTop: '8px', padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', fontSize: '0.82rem', color: '#1d4ed8' }}>
                  ℹ️ Your details have been auto-linked to the <strong>{scannedData.courseCode}</strong> OJT Head.
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                  <button onClick={() => { setStep(0); setScanState('idle'); setScannedData(null); }} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: 600 }}>
                    Re-upload
                  </button>
                  <button onClick={() => setStep(2)} style={{ ...s.btn, flex: 2, marginTop: 0 }}>
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Set Credentials ── */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 style={s.title}>Set your credentials</h2>
                <p style={s.sub}>Step 3 of 3 — Choose your login email and password. These are the only fields you set.</p>

                <div style={s.inputWrap}>
                  <Mail size={18} style={s.inputIcon} />
                  <input
                    style={s.input} type="email" placeholder="Your email address"
                    value={credentials.email}
                    onChange={e => setCredentials(p => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div style={{ ...s.inputWrap, position: 'relative' }}>
                  <Lock size={18} style={s.inputIcon} />
                  <input
                    style={s.input} type={showPassword ? 'text' : 'password'} placeholder="Create password (min. 6 chars)"
                    value={credentials.password}
                    onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
                  />
                  <button onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={s.inputWrap}>
                  <Lock size={18} style={s.inputIcon} />
                  <input
                    style={s.input} type="password" placeholder="Confirm password"
                    value={credentials.confirmPassword}
                    onChange={e => setCredentials(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>

                {credError && <div style={s.error}>{credError}</div>}

                <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '10px', fontSize: '0.82rem', color: '#15803d', margin: '12px 0' }}>
                  ✅ By registering, your account is immediately active and linked to your OJT Head.
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: 600 }}>
                    Back
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} style={{ ...s.btn, flex: 2, marginTop: 0, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account...</> : <>Create Account <CheckCircle size={18} /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
