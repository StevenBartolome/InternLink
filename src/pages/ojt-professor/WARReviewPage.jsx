// src/pages/ojt-professor/WARReviewPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, MessageSquare, User, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockWARQueue } from '../../services/mocks/ojtProfessorMockData';
import Toast from '../../components/common/Toast';

const STATUS_CONFIG = {
  APPROVED: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={13} /> },
  PENDING:  { label: 'Pending',  color: '#d97706', bg: '#fef9c3', icon: <Clock size={13} /> },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={13} /> },
};

export default function WARReviewPage() {
  const { showToast } = useOutletContext() || {};
  const [wars, setWars] = useState(mockWARQueue);
  const [filter, setFilter] = useState('PENDING');
  const [expanded, setExpanded] = useState(null);
  const [comments, setComments] = useState({});
  const [localToast, setLocalToast] = useState(null);

  const notify = (msg, type) => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  const handleAction = (id, action) => {
    if (action === 'REJECTED' && !comments[id]?.trim()) {
      notify('Please provide a comment before rejecting.', 'error');
      return;
    }
    setWars(prev => prev.map(w => w.id !== id ? w : { ...w, status: action, comment: comments[id] || '' }));
    setComments(prev => ({ ...prev, [id]: '' }));
    setExpanded(null);
    notify(`WAR ${action === 'APPROVED' ? 'approved' : 'rejected'}. Student has been notified.`, action === 'APPROVED' ? 'success' : 'info');
  };

  const filtered = wars.filter(w => filter === 'ALL' || w.status === filter);
  const pendingCount = wars.filter(w => w.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>WAR Review</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Review and give feedback on Weekly Activity Reports.</p>
        </div>
        {pendingCount > 0 && (
          <span style={{ padding: '6px 16px', borderRadius: '20px', backgroundColor: '#fef9c3', color: '#92400e', fontWeight: 700, fontSize: '0.875rem' }}>
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: theme.colors.bgSecondary, padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
              backgroundColor: filter === f ? '#fff' : 'transparent', color: filter === f ? theme.colors.primary : theme.colors.textMuted,
              boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 && (
          <div style={{ ...commonStyles.dashboardCard, padding: '40px', textAlign: 'center', color: theme.colors.textMuted }}>
            <FileText size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No WARs in this category.</p>
          </div>
        )}

        {filtered.map(war => {
          const st = STATUS_CONFIG[war.status];
          const isOpen = expanded === war.id;
          return (
            <div key={war.id} style={{ ...commonStyles.dashboardCard, padding: 0, overflow: 'hidden', border: war.status === 'REJECTED' ? '1px solid #fecaca' : `1px solid ${theme.colors.border}` }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', cursor: 'pointer', backgroundColor: war.status === 'REJECTED' ? '#fff5f5' : '#fff' }}
                onClick={() => setExpanded(isOpen ? null : war.id)}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: theme.colors.primary }}>
                  <User size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: theme.colors.textMain }}>{war.studentName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.75rem', fontWeight: 700 }}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, marginTop: '2px' }}>
                    {war.weekLabel} • Submitted: {war.submittedAt}
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} color={theme.colors.textMuted} /> : <ChevronDown size={16} color={theme.colors.textMuted} />}
              </div>

              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${theme.colors.border}` }}>
                  {[
                    { label: 'Week Summary', value: war.summary },
                    { label: 'Skills Learned', value: war.skillsLearned },
                    { label: 'Challenges', value: war.challenges },
                  ].map(f => (
                    <div key={f.label} style={{ marginTop: '14px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textMain, lineHeight: 1.65, backgroundColor: theme.colors.bgSecondary, padding: '10px 14px', borderRadius: '8px' }}>{f.value}</p>
                    </div>
                  ))}

                  {war.status === 'PENDING' && (
                    <div style={{ marginTop: '18px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>
                        <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Feedback / Comment
                      </label>
                      <textarea placeholder="Write feedback for the student..." value={comments[war.id] || ''}
                        onChange={e => setComments(p => ({ ...p, [war.id]: e.target.value }))}
                        style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', marginBottom: '12px' }} />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleAction(war.id, 'APPROVED')}
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, backgroundColor: '#16a34a' }}>
                          <CheckCircle size={16} /> Approve WAR
                        </button>
                        <button onClick={() => handleAction(war.id, 'REJECTED')}
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1, color: '#dc2626' }}>
                          <XCircle size={16} /> Reject WAR
                        </button>
                      </div>
                    </div>
                  )}

                  {war.comment && war.status !== 'PENDING' && (
                    <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: war.status === 'APPROVED' ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', borderLeft: `4px solid ${war.status === 'APPROVED' ? '#16a34a' : '#ef4444'}` }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: war.status === 'APPROVED' ? '#15803d' : '#dc2626', marginBottom: '4px' }}>Your Feedback:</div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: war.status === 'APPROVED' ? '#166534' : '#991b1b' }}>{war.comment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
