// src/components/student/stages/PostInternship.jsx
import React, { useState } from 'react';
import { Award, Upload, CheckCircle, Clock, FileText, Send, Star } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import Toast from '../../common/Toast';
import { useAuth } from '../../../context/AuthContext';
// import { portfolioItems, studentInternship } from '../../../services/mocks/mockData';

export default function PostInternship() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [items, setItems] = useState([]); // Real items will be fetched from DB
  const [submitted, setSubmitted] = useState(user?.stage3_submitted || false);
  const finalGrade = user?.final_grade; // null until OJT Head encodes

  const handleUpload = (itemId, file) => {
    if (!file) return;
    setItems(prev => prev.map(p => p.id === itemId ? { ...p, uploaded: true, fileUrl: file.name } : p));
    setToast({ message: `"${items.find(i => i.id === itemId)?.name}" uploaded!`, type: 'success' });
  };

  const allUploaded = items.every(i => i.uploaded);
  const uploadedCount = items.filter(i => i.uploaded).length;

  const handleSubmit = () => {
    if (!allUploaded) {
      setToast({ message: 'Please upload all portfolio items before submitting.', type: 'error' });
      return;
    }
    setSubmitted(true);
    setToast({ message: 'Portfolio submitted successfully! Awaiting OJT Head review and grading.', type: 'success' });
  };

  const gradeLabel = (g) => {
    if (!g) return null;
    const n = parseFloat(g);
    if (n <= 1.25) return { text: 'Excellent', color: '#16a34a', bg: '#dcfce7' };
    if (n <= 1.75) return { text: 'Very Good', color: '#2563eb', bg: '#dbeafe' };
    if (n <= 2.5)  return { text: 'Good', color: '#d97706', bg: '#fef9c3' };
    return { text: 'Satisfactory', color: '#94a3b8', bg: '#f1f5f9' };
  };

  const grade = gradeLabel(finalGrade);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Completion Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', borderRadius: '20px', padding: '32px', color: '#fff', textAlign: 'center' }}>
        <Award size={56} style={{ marginBottom: '12px', opacity: 0.9 }} />
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800 }}>Post-Internship Stage</h2>
        <p style={{ margin: '0 0 24px 0', opacity: 0.85, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
          Upload all portfolio components and submit for final grading by your OJT Head.
        </p>

        {finalGrade ? (
          <div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '24px 40px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, marginBottom: '8px' }}>Final Grade</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '6px' }}>{finalGrade}</div>
              {grade && (
                <span style={{ padding: '4px 16px', borderRadius: '20px', backgroundColor: grade.bg, color: grade.color, fontSize: '0.85rem', fontWeight: 700 }}>
                  {grade.text}
                </span>
              )}
            </div>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50px', fontWeight: 700, fontSize: '1rem' }}>
                <Star size={20} color="#fbbf24" fill="#fbbf24" /> INTERNSHIP COMPLETED
              </div>
            </div>
          </div>
        ) : submitted ? (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', display: 'inline-block', padding: '16px 32px', borderRadius: '12px' }}>
            <Clock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <span style={{ fontWeight: 600 }}>Portfolio submitted — awaiting OJT Head grading</span>
          </div>
        ) : (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', display: 'inline-block', padding: '16px 32px', borderRadius: '12px' }}>
            <span style={{ fontWeight: 600 }}>{uploadedCount}/{items.length} portfolio items uploaded</span>
          </div>
        )}
      </div>

      {/* Portfolio Upload */}
      {!finalGrade && (
        <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} color={theme.colors.primary} /> Portfolio Components
            </h3>
            <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted, fontWeight: 600 }}>{uploadedCount}/{items.length} Uploaded</span>
          </div>

          <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(uploadedCount / items.length) * 100}%`, backgroundColor: allUploaded ? '#16a34a' : theme.colors.primary, borderRadius: '4px', transition: 'width 0.5s' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: `1px solid ${item.uploaded ? '#bbf7d0' : theme.colors.border}`, borderRadius: '12px', backgroundColor: item.uploaded ? '#f0fdf4' : '#fff' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: item.uploaded ? '#dcfce7' : theme.colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.uploaded ? <CheckCircle size={18} color="#16a34a" /> : <FileText size={18} color={theme.colors.textMuted} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: theme.colors.textMain, fontSize: '0.9rem' }}>{item.name}</div>
                  {item.fileUrl && <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>{item.fileUrl}</div>}
                </div>
                {!submitted && (
                  <>
                    <input type="file" id={`port-${item.id}`} accept=".pdf,.doc,.docx,.jpg,.png" style={{ display: 'none' }} onChange={e => handleUpload(item.id, e.target.files[0])} />
                    <label htmlFor={`port-${item.id}`} style={{ ...commonStyles.dashboardBtn, ...(item.uploaded ? commonStyles.dashboardBtnSecondary : commonStyles.dashboardBtnPrimary), cursor: 'pointer', display: 'inline-flex', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}>
                      <Upload size={14} /> {item.uploaded ? 'Re-upload' : 'Upload'}
                    </label>
                  </>
                )}
              </div>
            ))}
          </div>

          {!submitted && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${theme.colors.border}` }}>
              {!allUploaded && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: '10px', fontSize: '0.85rem', color: '#92400e', marginBottom: '14px' }}>
                  ⚠️ Upload all {items.length} portfolio items before you can submit.
                </div>
              )}
              <button onClick={handleSubmit} disabled={!allUploaded} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, opacity: allUploaded ? 1 : 0.5 }}>
                <Send size={16} /> Submit Final Portfolio
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submitted state */}
      {submitted && !finalGrade && (
        <div style={{ ...commonStyles.dashboardCard, padding: '24px', textAlign: 'center' }}>
          <Clock size={40} color={theme.colors.primary} style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontWeight: 700, color: theme.colors.textMain }}>Portfolio Submitted!</h4>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
            Your OJT Head is reviewing your portfolio and supervisor evaluation. Your final grade will appear here once encoded.
          </p>
        </div>
      )}
    </div>
  );
}
