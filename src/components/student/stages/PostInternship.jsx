import React, { useState, useEffect } from 'react';
import {
  Award, Upload, CheckCircle, Clock, FileText, Send, Star,
  Sparkles, Download, Eye, EyeOff, Loader2, AlertCircle, RefreshCw, X,
} from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import Toast from '../../common/Toast';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import { portfolioService } from '../../../services/portfolioService';

// ─── Portfolio document checklist ────────────────────────────────────────────
const PORTFOLIO_DOCS = [
  // Required
  { id: 'resume', label: 'Resume', required: true },
  { id: 'certificate_completion', label: 'Certificate of Completion', required: true },
  // Main optional
  { id: 'evidence_achievements', label: 'Evidence of Achievements or Activities', required: false },
  // Other documents
  { id: 'cert_attendance_seminar', label: 'Certificate of Attendance (College Seminars/Workshops for Interns)', required: false },
  { id: 'student_evaluation', label: "Student's Evaluation of the Internship Program", required: false },
  { id: 'recommendation_letter', label: 'Recommendation Letter', required: false },
  { id: 'medical_certificate', label: 'Medical Certificate', required: false },
  { id: 'parent_consent', label: 'Parent/Guardian Consent', required: false },
  { id: 'ccit_orientation_cert', label: 'CCIT Internship Orientation Certificate of Attendance', required: false },
];

// ─── Reusable upload row ──────────────────────────────────────────────────────
function DocRow({ doc, uploaded, isUploading, submitted, onUpload, onRemove }) {
  const isPreloaded = uploaded?.source === 'pre-internship';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px',
      border: `1px solid ${uploaded ? (isPreloaded ? '#bfdbfe' : '#bbf7d0') : theme.colors.border}`,
      borderRadius: '10px',
      backgroundColor: uploaded ? (isPreloaded ? '#eff6ff' : '#f0fdf4') : '#fff',
    }}>
      {/* Icon */}
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
        backgroundColor: uploaded ? (isPreloaded ? '#dbeafe' : '#dcfce7') : theme.colors.bgSecondary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUploading
          ? <Loader2 size={15} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />
          : uploaded
            ? <CheckCircle size={15} color={isPreloaded ? '#2563eb' : '#16a34a'} />
            : <FileText size={15} color={theme.colors.textMuted} />}
      </div>

      {/* Label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {doc.label}
          {doc.required && <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 800 }}>*</span>}
          {isPreloaded && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              From Pre-Internship
            </span>
          )}
        </div>
        {uploaded?.name && (
          <div style={{ fontSize: '0.75rem', color: isPreloaded ? '#1d4ed8' : '#15803d', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {uploaded.name}
          </div>
        )}
      </div>

      {/* View link */}
      {uploaded?.url && (
        <a
          href={uploaded.url} target="_blank" rel="noopener noreferrer"
          style={{ padding: '6px', color: isPreloaded ? '#2563eb' : '#16a34a', backgroundColor: isPreloaded ? '#dbeafe' : '#dcfce7', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          title="View file"
        >
          <Eye size={14} />
        </a>
      )}

      {/* Remove pre-loaded doc */}
      {!submitted && uploaded && onRemove && (
        <button
          onClick={() => onRemove(doc.id)}
          title="Remove from portfolio"
          style={{ padding: '6px', color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      )}

      {/* Upload / Re-upload button */}
      {!submitted && (
        <>
          <input
            type="file" id={`pf-${doc.id}`}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) onUpload(doc.id, doc.label, e.target.files[0]); e.target.value = ''; }}
          />
          <label htmlFor={`pf-${doc.id}`} style={{
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, flexShrink: 0,
            color: uploaded ? '#1e40af' : theme.colors.primary,
            backgroundColor: uploaded ? '#dbeafe' : theme.colors.primaryLight,
            border: `1px solid ${uploaded ? '#93c5fd' : theme.colors.primary + '40'}`,
            display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
          }}>
            <Upload size={12} /> {uploaded ? 'Replace' : 'Upload'}
          </label>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostInternship() {
  const { user } = useAuth();

  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(user?.stage3_submitted || false);
  const finalGrade = user?.final_grade;

  // Step 1 — AI generation
  const [portfolioData, setPortfolioData] = useState(null);
  const [reflection, setReflection] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [progressVal, setProgressVal] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [editText, setEditText] = useState('');

  // Step 2 — document uploads
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploading, setUploading] = useState(null);

  // Session storage key tied to the current user/internship
  const sessionKey = user?.internship_id ? `portfolio_reflection_draft_${user.internship_id}` : null;

  // Load existing saved data and pre-populate from previous stages on mount
  useEffect(() => {
    if (!user?.internship_id) return;
    (async () => {
      try {
        const data = await portfolioService.fetchAllData(user.internship_id);
        setPortfolioData(data);

        // Priority 1: session-temporary draft (generated but not yet saved to DB)
        const sessionDraft = sessionKey ? sessionStorage.getItem(sessionKey) : null;
        if (sessionDraft) {
          setReflection(sessionDraft);
          setShowReflection(true);
        } else if (data.internship?.portfolio_reflection) {
          // Priority 2: previously saved draft in Supabase
          setReflection(data.internship.portfolio_reflection);
          setShowReflection(true);
        }
      } catch (err) {
        console.error('Failed to load portfolio data:', err);
      }

      // Load docs already uploaded for this portfolio (takes priority)
      const savedPortfolioDocs = await portfolioService.loadPortfolioDocs(user.internship_id);

      // Load files from pre-internship stage to auto-populate empty slots
      const preStageFiles = await portfolioService.fetchPreStageFiles(user.internship_id);

      // Persist any pre-stage files that aren't already in portfolio_documents so they
      // survive across sessions without needing to re-query pre-internship tables each time.
      portfolioService.syncPreStageDocsToPortfolio(user.internship_id, preStageFiles, savedPortfolioDocs);

      // Merge: portfolio uploads override pre-stage files for the same slot
      setUploadedDocs({ ...preStageFiles, ...savedPortfolioDocs });
    })();
  }, [user?.internship_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remove a doc from the portfolio slot (does not delete the original file)
  const handleRemoveDoc = (docId) => {
    setUploadedDocs(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  // ── Step 1: Generate reflection ──
  const handleGenerate = async () => {
    if (!user?.internship_id) return;
    setGenerating(true);
    setProgressVal(5);
    setGenerationProgress('Fetching required data...');
    try {
      let data = portfolioData;
      if (!data) {
        data = await portfolioService.fetchAllData(user.internship_id);
        setPortfolioData(data);
      }

      setProgressVal(25);
      setGenerationProgress('Compiling reports and analyzing activities...');
      await new Promise(r => setTimeout(r, 800));

      setProgressVal(40);
      setGenerationProgress('AI is writing the Personal Reflection (this may take 15-30 seconds)...');

      let currentProgress = 40;
      const interval = setInterval(() => {
        currentProgress += 1;
        if (currentProgress < 98) {
          setProgressVal(currentProgress);
        }
      }, 400);

      const text = await portfolioService.generateReflection(user, data);
      clearInterval(interval);

      setProgressVal(98);
      setGenerationProgress('Saving draft to session...');
      setReflection(text);
      setShowReflection(true);

      // Save temporarily in sessionStorage (cleared on logout, not saved to DB yet)
      if (sessionKey) {
        sessionStorage.setItem(sessionKey, text);
      }

      setProgressVal(100);
      setToast({ message: '✨ Reflection generated! Review', type: 'success' });
      await new Promise(r => setTimeout(r, 800)); // Show 100% briefly
    } catch (err) {
      console.error(err);
      setToast({ message: `Generation failed: ${err.message}`, type: 'error' });
    } finally {
      setGenerating(false);
      setGenerationProgress('');
      setProgressVal(0);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setReflection(editText);
      setIsEditingReflection(false);

      const { error } = await supabase.from('student_internships')
        .update({ portfolio_reflection: editText })
        .eq('id', user.internship_id);

      if (error) throw error;

      // Saved permanently — remove the temporary session draft
      if (sessionKey) sessionStorage.removeItem(sessionKey);

      setToast({ message: '✅ Draft saved permanently!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save draft.', type: 'error' });
    }
  };

  const handleDeleteReflection = async () => {
    if (!window.confirm('Are you sure you want to delete your Personal Reflection draft completely? This cannot be undone.')) return;
    try {
      setReflection('');
      setShowReflection(false);
      setIsEditingReflection(false);

      // Clear both session draft and DB record
      if (sessionKey) sessionStorage.removeItem(sessionKey);

      const { error } = await supabase.from('student_internships')
        .update({ portfolio_reflection: null })
        .eq('id', user.internship_id);

      if (error) throw error;
      setToast({ message: 'Personal Reflection deleted completely.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete reflection.', type: 'error' });
    }
  };

  // ── Step 2: Upload a document ──
  const handleUpload = async (docId, docLabel, file) => {
    setUploading(docId);
    try {
      const url = await portfolioService.uploadPortfolioDoc(user.internship_id, docId, docLabel, file);
      setUploadedDocs(prev => ({ ...prev, [docId]: { url, name: file.name } }));
      setToast({ message: `"${docLabel}" uploaded!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setUploading(null);
    }
  };

  // ── Step 3a: Download PDF ──
  const handleDownload = async () => {
    if (!reflection) {
      setToast({ message: 'Generate your Personal Reflection first.', type: 'error' });
      return;
    }
    
    setToast({ message: 'Compiling PDF and fetching attachments (this may take a moment)...', type: 'info' });
    
    try {
      const data = portfolioData || await portfolioService.fetchAllData(user.internship_id);
      
      // Build and compile the entire PDF including correct interleaving of attachments
      const finalPdfBytes = await portfolioService.compilePortfolio(
        user, data.internship, data.company,
        data.weeklyReports, data.attendance, reflection, uploadedDocs
      );
      const filename = portfolioService.getFilename(user, data.internship, data.company);
      
      // 4. Trigger download
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setToast({ message: 'Portfolio compiled and downloaded successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'PDF compilation failed. Please try again.', type: 'error' });
    }
  };

  // ── Step 3b: Submit portfolio ──
  const handleSubmit = async () => {
    if (!reflection) {
      setToast({ message: 'Please generate your Personal Reflection first (Step 1).', type: 'error' });
      return;
    }
    const missingRequired = PORTFOLIO_DOCS.filter(d => d.required && !uploadedDocs[d.id]);
    if (missingRequired.length) {
      setToast({ message: `Please upload: ${missingRequired.map(d => d.label).join(', ')}.`, type: 'error' });
      return;
    }
    try {
      const { error } = await supabase
        .from('student_internships')
        .update({ stage3_submitted: true })
        .eq('student_id', user.id);
      if (error) throw error;
      setSubmitted(true);
      setToast({ message: 'Portfolio submitted! Awaiting OJT Adviser grading.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Submit failed. Please try again.', type: 'error' });
    }
  };

  // ── Grade helpers ──
  const gradeLabel = (g) => {
    if (!g) return null;
    const n = parseFloat(g);
    if (n <= 1.25) return { text: 'Excellent', color: '#16a34a', bg: '#dcfce7' };
    if (n <= 1.75) return { text: 'Very Good', color: '#2563eb', bg: '#dbeafe' };
    if (n <= 2.5) return { text: 'Good', color: '#d97706', bg: '#fef9c3' };
    return { text: 'Satisfactory', color: '#94a3b8', bg: '#f1f5f9' };
  };
  const grade = gradeLabel(finalGrade);

  const uploadedCount = Object.keys(uploadedDocs).length;
  const requiredDone = PORTFOLIO_DOCS.filter(d => d.required).every(d => uploadedDocs[d.id]);
  const canSubmit = reflection && requiredDone && !submitted;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        borderRadius: '20px', padding: '32px', color: '#fff', textAlign: 'center',
      }}>
        <Award size={52} style={{ marginBottom: '12px', opacity: 0.9 }} />
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800 }}>
          Post-Internship Portfolio
        </h2>
        <p style={{ margin: '0 0 24px 0', opacity: 0.85, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
          Generate your portfolio using AI, upload required documents, and submit for final grading.
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50px', fontWeight: 700 }}>
                <Star size={20} color="#fbbf24" fill="#fbbf24" /> INTERNSHIP COMPLETED
              </span>
            </div>
          </div>
        ) : submitted ? (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', display: 'inline-block', padding: '16px 32px', borderRadius: '12px' }}>
            <Clock size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            <span style={{ fontWeight: 600 }}>Portfolio submitted — awaiting OJT Adviser grading</span>
          </div>
        ) : (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: '20px', padding: '14px 28px', borderRadius: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {uploadedCount}/{PORTFOLIO_DOCS.length} Documents Uploaded
            </span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {reflection ? '✓ Reflection Generated' : '○ Reflection Pending'}
            </span>
          </div>
        )}
      </div>

      {!finalGrade && (
        <>
          {/* ── STEP 1: Upload documents ──────────────────────────────────── */}
          <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} color={theme.colors.primary} />
                Step 1 — Upload Documents
              </h3>
              <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted, fontWeight: 600 }}>
                {uploadedCount} / {PORTFOLIO_DOCS.length} uploaded
              </span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>
              Upload physical documents to compile your complete portfolio. Items marked <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span> are required before you can generate your portfolio reflection.
            </p>

            {/* Progress bar */}
            <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(uploadedCount / PORTFOLIO_DOCS.length) * 100}%`,
                backgroundColor: uploadedCount === PORTFOLIO_DOCS.length ? '#16a34a' : theme.colors.primary,
                borderRadius: '4px', transition: 'width 0.5s',
              }} />
            </div>

            {/* Required */}
            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: theme.colors.textMuted }}>
              Required Documents
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {PORTFOLIO_DOCS.filter(d => d.required).map(doc => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  uploaded={uploadedDocs[doc.id]}
                  isUploading={uploading === doc.id}
                  submitted={submitted}
                  onUpload={handleUpload}
                  onRemove={handleRemoveDoc}
                />
              ))}
            </div>

            {/* Optional */}
            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: theme.colors.textMuted }}>
              Other Documents (Optional)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {PORTFOLIO_DOCS.filter(d => !d.required).map(doc => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  uploaded={uploadedDocs[doc.id]}
                  isUploading={uploading === doc.id}
                  submitted={submitted}
                  onUpload={handleUpload}
                  onRemove={handleRemoveDoc}
                />
              ))}
            </div>

            <div style={{ marginTop: '8px', padding: '12px 14px', backgroundColor: '#eff6ff', borderRadius: '10px', fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.6 }}>
              <strong>Note:</strong> Documents matching slots above were automatically pre-loaded from your previous stages (shown with a <strong>From Pre-Internship</strong> badge). Click <strong>×</strong> to remove a pre-loaded document from your portfolio, or <strong>Replace</strong> to swap it with a new file. Your Internship Agreement and Internship Plan are included in the generated PDF automatically.
            </div>
          </div>

          {/* ── STEP 2: Generate Portfolio Reflection ────────────────────────── */}
          <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#7c3aed" />
                  Step 2 — Generate Portfolio Reflection
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: theme.colors.textMuted }}>
                  {requiredDone
                    ? 'AI compiles your weekly reports and activities into a formal Personal Reflection (5+ pages).'
                    : 'Upload the required documents in Step 1 first before generating your portfolio reflection.'}
                </p>
              </div>
              {reflection && (
                <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ✓ Generated
                </span>
              )}
            </div>

            {/* Gate banner — shown when required docs are missing */}
            {!requiredDone && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa', borderRadius: '10px',
                fontSize: '0.82rem', color: '#9a3412', fontWeight: 600,
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <span>
                  Please upload the <strong>required documents</strong> (Resume &amp; Certificate of Completion) in Step 1 to unlock reflection generation.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleGenerate}
                disabled={generating || !requiredDone}
                style={{ ...commonStyles.dashboardBtn, backgroundColor: '#7c3aed', color: '#fff', border: '1px solid #7c3aed', opacity: (generating || !requiredDone) ? 0.5 : 1, cursor: (!requiredDone || generating) ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {generating
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating with AI...</>
                  : reflection
                    ? <><RefreshCw size={15} /> Regenerate Reflection</>
                    : <><Sparkles size={15} /> Generate Reflection with AI</>}
              </button>

              {reflection && (
                <>
                  <button
                    onClick={() => setShowReflection(p => !p)}
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    {showReflection ? <EyeOff size={15} /> : <Eye size={15} />}
                    {showReflection ? 'Hide' : 'Preview'} Reflection
                  </button>
                  <button
                    onClick={handleDownload}
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, color: '#1e40af', borderColor: '#1e40af', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download size={15} /> Download Portfolio PDF
                  </button>
                </>
              )}
            </div>

            {generating && generationProgress && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f3e8ff', borderRadius: '12px', border: '1px solid #e9d5ff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    {generationProgress}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9333ea' }}>
                    {progressVal}%
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e9d5ff', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressVal}%`, backgroundColor: '#9333ea', transition: 'width 0.5s ease-out' }} />
                </div>
              </div>
            )}

            {showReflection && (reflection || isEditingReflection) && (
              <div style={{ marginTop: '16px', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Session-draft banner */}
                {sessionKey && sessionStorage.getItem(sessionKey) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <span>This reflection is a <strong>temporary session draft</strong> — it will disappear when you log out. Click <strong>"Save Draft Permanently"</strong> to keep it.</span>
                  </div>
                )}
                {isEditingReflection ? (
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{ width: '100%', minHeight: '260px', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, color: '#334155', outline: 'none', resize: 'vertical' }}
                    placeholder="Write or edit your reflection draft here..."
                  />
                ) : (
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '0.84rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#374151' }}>{reflection}</pre>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  {isEditingReflection ? (
                    <>
                      <button onClick={() => setIsEditingReflection(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>Cancel</button>
                      <button onClick={handleSaveDraft} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>💾 Save Draft Permanently</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditText(reflection); setIsEditingReflection(true); }} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>✏️ Edit Draft</button>
                      <button onClick={handleDeleteReflection} style={{ ...commonStyles.dashboardBtn, backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>🗑️ Delete Completely</button>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ── STEP 3: Download & Submit ─────────────────────────────────── */}
          <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} color={theme.colors.primary} />
              Step 3 — Download & Submit
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>
              Download your generated portfolio PDF (Title Page, Reflection, Company Profile, WARs, Attendance).
              Merge it with your uploaded documents to form the final PDF, then submit.
            </p>

            {/* Validation alerts */}
            {!reflection && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fffbeb', borderRadius: '10px', fontSize: '0.84rem', color: '#92400e', marginBottom: '10px' }}>
                <AlertCircle size={15} /> Generate your Personal Reflection first (Step 2).
              </div>
            )}
            {reflection && !requiredDone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fffbeb', borderRadius: '10px', fontSize: '0.84rem', color: '#92400e', marginBottom: '10px' }}>
                <AlertCircle size={15} /> Upload all required documents (Resume, Certificate of Completion) first.
              </div>
            )}

            {submitted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                <CheckCircle size={26} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: 700, color: '#166534' }}>Portfolio Submitted!</div>
                  <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '2px' }}>
                    Your OJT Adviser is reviewing your submission. Your final grade will appear here once encoded.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {reflection && (
                  <button
                    onClick={handleDownload}
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download size={15} /> Download Portfolio PDF
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, opacity: canSubmit ? 1 : 0.4, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={15} /> Submit Portfolio
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Submitted-but-not-graded state */}
      {submitted && !finalGrade && (
        <div style={{ ...commonStyles.dashboardCard, padding: '24px', textAlign: 'center' }}>
          <Clock size={40} color={theme.colors.primary} style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontWeight: 700, color: theme.colors.textMain }}>Awaiting Final Grade</h4>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
            Your OJT Adviser will review your portfolio and supervisor evaluation, then encode your final grade.
          </p>
        </div>
      )}
    </div>
  );
}
