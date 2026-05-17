// src/components/student/stages/PreInternship.jsx
import React, { useState } from 'react';
import { Building2, MapPin, Briefcase, Upload, CheckCircle, XCircle, Clock, AlertCircle, FileText, ChevronDown, ChevronUp, Send, Eye, RotateCcw } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import Toast from '../../common/Toast';
import ConfirmModal from '../../common/ConfirmModal';
import { useAuth } from '../../../context/AuthContext';
import { studentService } from '../../../services/studentService';
import { adminService } from '../../../services/adminService';

const STATUS_CONFIG = {
  APPROVED:      { label: 'Approved',      color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  PENDING:       { label: 'Pending',       color: '#d97706', bg: '#fef9c3', icon: <Clock size={14} /> },
  REJECTED:      { label: 'Rejected',      color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> },
  NOT_SUBMITTED: { label: 'Not Submitted', color: '#94a3b8', bg: '#f1f5f9', icon: <AlertCircle size={14} /> },
};

const MOA_COLORS = { NOT_STARTED: '#94a3b8', IN_PROGRESS: '#d97706', PROCESSED: '#16a34a' };
const MOA_LABELS = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', PROCESSED: 'Processed' };

export default function PreInternship({ onDeploy }) {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const [docs, setDocs] = useState([]); // Real docs will be fetched from DB
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    companyName: user?.company_name || '',
    companyAddress: user?.company_address || '',
    position: user?.position || '',
  });
  const [companySaved, setCompanySaved] = useState(!!user?.company_name);
  const moaStatus = user?.moa_status || 'NOT_STARTED';
  const deploymentApproved = user?.is_deployed || false;

  React.useEffect(() => {
    if (user?.internship_id) {
      fetchDocs();
    }
  }, [user]);

  const fetchDocs = async () => {
    const hasExistingDocs = docs.length > 0;
    try {
      if (!hasExistingDocs) {
        setLoading(true);
      }
      
      // 1. Fetch current documents first for INSTANT render!
      const data = await studentService.getPreInternshipDocuments(user?.internship_id);
      setDocs(data);
      
      // 2. Hide loading spinner immediately so the UI is active and responsive
      setLoading(false);

      // 3. Sync in the background silently to fetch new templates without blocking the UI
      const programId = user?.program_id || user?.profile?.program_id;
      if (user?.internship_id && programId) {
        await adminService.syncStudentChecklist(user.internship_id, programId);
        
        // Quietly fetch again in case new templates were synced
        const syncedData = await studentService.getPreInternshipDocuments(user.internship_id);
        
        // Only update state if count or content changed to prevent unnecessary re-renders
        if (syncedData.length !== data.length || JSON.stringify(syncedData) !== JSON.stringify(data)) {
          setDocs(syncedData);
        }
      }
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docId, file) => {
    if (!file) return;
    try {
      setToast({ message: 'Uploading document...', type: 'info' });
      const doc = docs.find(d => d.id === docId);
      await studentService.uploadDocument(docId, file, doc?.isAdditional);
      await fetchDocs();
      setToast({ message: 'Document uploaded — pending review.', type: 'success' });
    } catch (err) {
      console.error('Upload failed:', err);
      setToast({ message: 'Upload failed. Please try again.', type: 'error' });
    }
  };

  const handleUndoSubmission = (docId, isAdditional) => {
    setConfirmModal({
      isOpen: true,
      title: 'Recall Submission',
      message: 'Are you sure you want to undo this submission? This will recall your file.',
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          setToast({ message: 'Recalling document...', type: 'info' });
          await studentService.undoSubmission(docId, isAdditional);
          await fetchDocs();
          setToast({ message: 'Document submission recalled.', type: 'success' });
        } catch (err) {
          console.error('Undo failed:', err);
          setToast({ message: 'Failed to undo submission.', type: 'error' });
        }
      }
    });
  };

  const handleCompanySave = (e) => {
    e.preventDefault();
    setCompanySaved(true);
    setToast({ message: 'Company information saved!', type: 'success' });
  };

  const approvedCount = docs.filter(d => d.status === 'Approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {deploymentApproved && (
        <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: '16px', padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CheckCircle size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Deployment Approved! 🎉</div>
            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Your OJT Adviser cleared you. Stage 2 is now unlocked.</div>
          </div>
        </div>
      )}

      {/* Company Info */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
          <Building2 size={22} color={theme.colors.primary} /> Company Information
        </h2>
        {companySaved ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: <Building2 size={16} />, label: 'Company', value: companyForm.companyName },
              { icon: <MapPin size={16} />, label: 'Address', value: companyForm.companyAddress },
              { icon: <Briefcase size={16} />, label: 'Position', value: companyForm.position },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', backgroundColor: theme.colors.bgSecondary, borderRadius: '10px' }}>
                <span style={{ color: theme.colors.primary, marginTop: '1px' }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: 600, marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{r.value}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setCompanySaved(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, alignSelf: 'flex-start', marginTop: '6px' }}>Edit Info</button>
          </div>
        ) : (
          <form onSubmit={handleCompanySave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'companyName', label: 'Company Name', placeholder: 'e.g. NexGen Software Solutions' },
              { key: 'companyAddress', label: 'Company Address', placeholder: 'e.g. 21F Ayala Tower, BGC, Taguig City' },
              { key: 'position', label: 'Position / Role', placeholder: 'e.g. Full-Stack Developer Intern' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.875rem', color: theme.colors.textSecondary }}>{f.label}</label>
                <input required style={{ ...commonStyles.input, width: '100%', boxSizing: 'box-border' }} placeholder={f.placeholder}
                  value={companyForm[f.key]} onChange={e => setCompanyForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, alignSelf: 'flex-start' }}>
              <Send size={16} /> Save Company Info
            </button>
          </form>
        )}
      </div>

      {/* Document Checklist */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
            <FileText size={22} color={theme.colors.primary} /> Document Checklist
          </h2>
          <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted, fontWeight: 600 }}>{approvedCount}/{docs.length} Approved</span>
        </div>
        <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: docs.length > 0 ? `${(approvedCount / docs.length) * 100}%` : '0%', backgroundColor: '#16a34a', borderRadius: '4px', transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px 20px',
              width: '100%'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                border: `3px solid ${theme.colors.primary}20`,
                borderTop: `3px solid ${theme.colors.primary}`,
                borderRadius: '50%',
                animation: 'spin-loader 0.8s linear infinite',
                marginBottom: '12px'
              }} />
              <style>{`
                @keyframes spin-loader {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted }}>Loading checklist...</span>
            </div>
          ) : docs.length === 0 ? (
             <div style={{ padding: '20px', textAlign: 'center', color: theme.colors.textMuted }}>No documents required yet.</div>
          ) : docs.map(doc => {
            const st = STATUS_CONFIG[doc.status === 'Approved' ? 'APPROVED' : doc.status === 'Pending review' ? 'PENDING' : doc.status.includes('Rejected') ? 'REJECTED' : 'NOT_SUBMITTED'];
            const isOpen = expandedDoc === doc.id;
            return (
              <div key={doc.id} style={{ border: `1px solid ${doc.status.includes('Rejected') ? '#fecaca' : theme.colors.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: doc.status.includes('Rejected') ? '#fff5f5' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpandedDoc(isOpen ? null : doc.id)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                    {st.icon} {st.label}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600, color: theme.colors.textMain, fontSize: '0.9rem' }}>{doc.name}</span>
                  {doc.submittedAt && <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{new Date(doc.submittedAt).toLocaleDateString()}</span>}
                  {isOpen ? <ChevronUp size={16} color={theme.colors.textMuted} /> : <ChevronDown size={16} color={theme.colors.textMuted} />}
                </div>
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                    {doc.status.includes('Rejected') && doc.comment && (
                      <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>OJT Adviser Comment:</div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>{doc.comment}</p>
                      </div>
                    )}

                    {doc.status === 'Pending review' && (
                      <div style={{ padding: '12px 14px', backgroundColor: '#fef9c3', borderRadius: '8px', borderLeft: '4px solid #d97706', fontSize: '0.825rem', color: '#854d0e', fontWeight: 600 }}>
                        Your document is submitted and pending review. You can undo submission to recall and modify it.
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {/* View Button */}
                      {doc.fileUrl && (
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            ...commonStyles.dashboardBtn, 
                            backgroundColor: doc.status === 'Approved' ? '#dcfce7' : '#eff6ff', 
                            color: doc.status === 'Approved' ? '#16a34a' : '#1d4ed8', 
                            border: `1px solid ${doc.status === 'Approved' ? '#bbf7d0' : '#bfdbfe'}`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          <Eye size={16} /> View Submitted File
                        </a>
                      )}

                      {/* Undo Submission button */}
                      {doc.status === 'Pending review' && (
                        <button
                          onClick={() => handleUndoSubmission(doc.id, doc.isAdditional)}
                          style={{
                            ...commonStyles.dashboardBtn,
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <RotateCcw size={16} /> Undo Submission
                        </button>
                      )}

                      {/* File Uploader for Not Submitted or Rejected states */}
                      {(doc.status === 'Not submitted' || doc.status.includes('Rejected')) && (
                        <div>
                          <input 
                            type="file" 
                            id={`file-${doc.id}`} 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            style={{ display: 'none' }} 
                            onChange={e => handleFileUpload(doc.id, e.target.files[0])} 
                          />
                          <label 
                            htmlFor={`file-${doc.id}`} 
                            style={{ 
                              ...commonStyles.dashboardBtn, 
                              ...commonStyles.dashboardBtnPrimary, 
                              cursor: 'pointer', 
                              display: 'inline-flex', 
                              gap: '8px',
                              fontSize: '0.85rem'
                            }}
                          >
                            <Upload size={16} /> {doc.status.includes('Rejected') ? 'Re-upload File' : 'Upload Document'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MOA + Deployment */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ ...commonStyles.dashboardCard, padding: '24px', flex: 1, minWidth: '240px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>MOA Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: MOA_COLORS[moaStatus] }} />
            <span style={{ fontWeight: 700, color: MOA_COLORS[moaStatus] }}>{MOA_LABELS[moaStatus]}</span>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>Updated by your OJT Adviser. Actual MOA drafting is handled offline.</p>
        </div>

        <div style={{ ...commonStyles.dashboardCard, padding: '24px', flex: 1, minWidth: '240px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Deployment Status</h3>
          {deploymentApproved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700 }}><CheckCircle size={20} /> Approved — You're Deployed!</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textMuted, fontWeight: 600 }}><Clock size={20} color={theme.colors.warning} /> Awaiting OJT Adviser Approval</div>
          )}
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>
            {deploymentApproved ? 'Your OJT Adviser approved your deployment. Proceed to Stage 2.' : 'OJT Adviser will approve after all documents and MOA are processed.'}
          </p>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}
