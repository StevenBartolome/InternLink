import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowLeft, ArrowRight, Lock, Info
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  // ─── Styles ──────────────────────────────────────────────────────
  const s = {
    page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
    brand: {
      flex: 1, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      padding: '4rem', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', color: '#fff',
    },
    form: {
      flex: 1.3, backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
      overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.03)',
    },
    inner: { maxWidth: '520px', width: '100%', margin: '0 auto', padding: '3rem 2rem' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif" },
    sub: { color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' },
    btn: {
      width: '100%', padding: '14px', borderRadius: '12px',
      backgroundColor: '#1e40af', color: '#fff', border: 'none',
      fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      transition: 'background-color 0.2s', marginTop: '8px',
    },
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
            The OJT Portal<br /><span style={{ color: '#fbbf24' }}>Redefined</span>
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7, fontSize: '1.05rem' }}>
            A unified platform for managing the complete internship journey — from deployment tracking to final evaluation.
          </p>
        </div>
        <div style={{ opacity: 0.4, fontSize: '0.8rem' }}>© {new Date().getFullYear()} InternLink</div>
      </div>

      {/* Message side */}
      <div style={s.form}>
        <div style={{ padding: '1.5rem 2rem' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <ArrowLeft size={18} /> Back to Login
          </button>
        </div>

        <div style={{ ...s.inner, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fff7ed', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Lock size={40} color="#f97316" />
            </div>
            <h2 style={s.title}>Self-Registration Disabled</h2>
            <p style={{ ...s.sub, marginBottom: '2rem' }}>
              Student accounts are now created exclusively by the <strong>OJT Adviser</strong> or <strong>Professor</strong>.
            </p>

            <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '16px', textAlign: 'left', marginBottom: '2rem', border: '1px solid #dbeafe' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} /> How to get your account?
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#1e40af', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <li>Contact your OJT Adviser or Program Chair.</li>
                <li>Provide them with your active university email.</li>
                <li>Wait for an email containing your login credentials.</li>
              </ul>
            </div>

            <button onClick={() => navigate('/login')} style={s.btn}>
              Return to Login <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
