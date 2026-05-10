// src/pages/ojt-professor/DocumentReviewPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, Building2, Rocket, ChevronDown, ChevronUp, AlertCircle, User } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockDocumentQueue } from '../../services/mocks/ojtProfessorMockData';
import Toast from '../../components/common/Toast';

const DOC_STATUS = {
  APPROVED: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={13} /> },
  PENDING:  { label: 'Pending',  color: '#d97706', bg: '#fef9c3', icon: <Clock size={13} /> },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={13} /> },
};

const MOA_OPTS = ['NOT_STARTED', 'IN_PROGRESS', 'PROCESSED'];
const MOA_LABELS = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', PROCESSED: 'Processed' };
const MOA_COLORS = { NOT_STARTED: '#94a3b8', IN_PROGRESS: '#d97706', PROCESSED: '#16a34a' };

export default function DocumentReviewPage() {
  const { showToast } = useOutletContext() || {};
  const [queue, setQueue] = useState(mockDocumentQueue);
  const [expanded, setExpanded] = useState(null);
  const [rejectComment, setRejectComment] = useState({});
  const [localToast, setLocalToast] = useState(null);

  const notify = (msg, type) => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  const handleDocAction = (studentId, docId, action) => {
    if (action === 'REJECTED' && !rejectComment[docId]?.trim()) {
      notify('Please enter a comment before rejecting.', 'error');
      return;
    }
    setQueue(prev => prev.map(s => s.studentId !== studentId ? s : {
      ...s,
      docs: s.docs.map(d => d.id !== docId ? d : {
        ...d, status: action, comment: action === 'REJECTED' ? rejectComment[docId] : '',
      }),
    }));
    setRejectComment(prev => ({ ...prev, [docId]: '' }));
    notify(`Document ${action === 'APPROVED' ? 'approved' : 'rejected'}.`, action === 'APPROVED' ? 'success' : 'info');
  };

  const handleMOAChange = (studentId, newStatus) => {
    setQueue(prev => prev.map(s => s.studentId !== studentId ? s : { ...s, moaStatus: newStatus }));
    notify(`MOA status updated to "${MOA_LABELS[newStatus]}".`, 'success');
  };

  const handleDeploy = (studentId, studentName) => {
    setQueue(prev => prev.map(s => s.studentId !== studentId ? s : { ...s, deploymentApproved: true }));
    notify(`✅ ${studentName} has been approved for deployment! Stage 2 unlocked.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Pre-Internship Document Review</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Review student documents, update MOA status, and approve deployment.</p>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: '20px', backgroundColor: '#fef9c3', color: '#92400e', fontWeight: 700, fontSize: '0.875rem' }}>
          {queue.filter(s => s.docs.some(d => d.status === 'PENDING')).length} Students Pending Review
        </span>
      </div>

      {queue.map(student => {
        const isOpen = expanded === student.studentId;
        const pendingCount = student.docs.filter(d => d.status === 'PENDING').length;
        const approvedCount = student.docs.filter(d => d.status === 'APPROVED').length;
        const allApproved = student.docs.length > 0 && approvedCount === student.docs.length;
        const canDeploy = allApproved && student.moaStatus === 'PROCESSED' && !student.deploymentApproved;

        return (
          <div key={student.studentId} style={{ ...commonStyles.dashboardCard, padding: 0, overflow: 'hidden', border: student.deploymentApproved ? '1px solid #bbf7d0' : `1px solid ${theme.colors.border}` }}>
            {/* Student header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', cursor: 'pointer', backgroundColor: student.deploymentApproved ? '#f0fdf4' : '#fff' }}
              onClick={() => setExpanded(isOpen ? null : student.studentId)}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: theme.colors.primary }}>
                <User size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: theme.colors.textMain, fontSize: '1rem' }}>{student.studentName}</div>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
                  {student.company ? `${student.company} • ${student.position}` : 'No company submitted yet'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {student.deploymentApproved ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>
                    <CheckCircle size={13} /> Deployed
                  </span>
                ) : pendingCount > 0 ? (
                  <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#fef9c3', color: '#92400e', fontSize: '0.78rem', fontWeight: 700 }}>
                    {pendingCount} Pending
                  </span>
                ) : null}
                {isOpen ? <ChevronUp size={18} color={theme.colors.textMuted} /> : <ChevronDown size={18} color={theme.colors.textMuted} />}
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${theme.colors.border}` }}>
                {student.docs.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: theme.colors.textMuted }}>
                    <AlertCircle size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>No documents submitted yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {student.docs.map(doc => {
                      const st = DOC_STATUS[doc.status] || DOC_STATUS.PENDING;
                      return (
                        <div key={doc.id} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                              {st.icon} {st.label}
                            </span>
                            <span style={{ flex: 1, fontWeight: 600, color: theme.colors.textMain, fontSize: '0.9rem' }}>{doc.name}</span>
                            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{doc.submittedAt}</span>
                          </div>
                          {doc.status === 'PENDING' && (
                            <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${theme.colors.border}` }}>
                              <textarea placeholder="Add a comment (required for rejection)..." value={rejectComment[doc.id] || ''} onChange={e => setRejectComment(p => ({ ...p, [doc.id]: e.target.value }))}
                                style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '60px', marginTop: '10px', marginBottom: '10px', resize: 'vertical', fontSize: '0.85rem' }} />
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleDocAction(student.studentId, doc.id, 'APPROVED')}
                                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, backgroundColor: '#16a34a', flex: 1 }}>
                                  <CheckCircle size={15} /> Approve
                                </button>
                                <button onClick={() => handleDocAction(student.studentId, doc.id, 'REJECTED')}
                                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, color: '#dc2626', flex: 1 }}>
                                  <XCircle size={15} /> Reject
                                </button>
                              </div>
                            </div>
                          )}
                          {doc.status === 'REJECTED' && doc.comment && (
                            <div style={{ padding: '8px 16px', backgroundColor: '#fef2f2', borderTop: `1px solid #fecaca` }}>
                              <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>Comment: </span>
                              <span style={{ fontSize: '0.78rem', color: '#991b1b' }}>{doc.comment}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MOA + Deploy section */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <div style={{ ...commonStyles.dashboardCard, padding: '16px', flex: 1, minWidth: '220px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '8px' }}>MOA Status</div>
                    <select value={student.moaStatus} onChange={e => handleMOAChange(student.studentId, e.target.value)}
                      style={{ ...commonStyles.input, width: '100%', fontWeight: 600, color: MOA_COLORS[student.moaStatus] }}>
                      {MOA_OPTS.map(o => <option key={o} value={o}>{MOA_LABELS[o]}</option>)}
                    </select>
                  </div>

                  {!student.deploymentApproved && (
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'flex-end' }}>
                      <button onClick={() => handleDeploy(student.studentId, student.studentName)} disabled={!canDeploy}
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, width: '100%', opacity: canDeploy ? 1 : 0.4,
                          background: canDeploy ? 'linear-gradient(135deg, #16a34a, #15803d)' : undefined }}>
                        <Rocket size={16} /> Approve Deployment
                      </button>
                    </div>
                  )}
                  {student.deploymentApproved && (
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700, padding: '16px' }}>
                      <CheckCircle size={20} /> Student Deployed!
                    </div>
                  )}
                </div>
                {!canDeploy && !student.deploymentApproved && (
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: theme.colors.textMuted }}>
                    ⚠️ Deployment requires: all documents approved + MOA status = "Processed"
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
