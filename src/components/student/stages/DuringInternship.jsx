// src/components/student/stages/DuringInternship.jsx
import React, { useState } from 'react';
import { Clock, CheckCircle, Upload, ChevronDown, ChevronUp, XCircle, Plus, Send } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import Toast from '../../common/Toast';
import { useAuth } from '../../../context/AuthContext';
// import { attendanceLogs, warSubmissions, studentInternship, completionDocs } from '../../../services/mocks/mockData';

const WAR_STATUS = {
  APPROVED: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={13} /> },
  PENDING:  { label: 'Pending',  color: '#d97706', bg: '#fef9c3', icon: <Clock size={13} /> },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={13} /> },
};

const ATT_STATUS = {
  PRESENT:  { color: '#16a34a', bg: '#dcfce7' },
  HALF_DAY: { color: '#d97706', bg: '#fef9c3' },
  ABSENT:   { color: '#dc2626', bg: '#fee2e2' },
};

export default function DuringInternship({ onComplete }) {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [logs, setLogs] = useState([]); // Real logs will be fetched from DB
  const [wars, setWars] = useState([]); // Real reports will be fetched from DB
  const [newLog, setNewLog] = useState({ date: '', timeIn: '', timeOut: '', activities: '' });
  const [newWAR, setNewWAR] = useState({ summary: '', skillsLearned: '', challenges: '' });
  const [activeTab, setActiveTab] = useState('attendance');
  const [showWARForm, setShowWARForm] = useState(false);
  const [expandedWAR, setExpandedWAR] = useState(null);
  const [compDocs, setCompDocs] = useState({}); // Real docs will be fetched from DB

  const totalHours = logs.reduce((acc, l) => acc + (l.hours || 0), 0);
  const requiredHours = user?.required_hours || 486;
  const hoursProgress = Math.min((totalHours / requiredHours) * 100, 100);

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.date || !newLog.timeIn || !newLog.timeOut) return;
    const [h1, m1] = newLog.timeIn.split(':').map(Number);
    const [h2, m2] = newLog.timeOut.split(':').map(Number);
    const hrs = parseFloat(((h2 * 60 + m2 - h1 * 60 - m1) / 60).toFixed(2));
    setLogs(prev => [{ id: `a${Date.now()}`, ...newLog, hours: hrs, status: 'PRESENT' }, ...prev]);
    setNewLog({ date: '', timeIn: '', timeOut: '', activities: '' });
    setToast({ message: `Attendance logged — ${hrs} hours recorded.`, type: 'success' });
  };

  const handleSubmitWAR = (e) => {
    e.preventDefault();
    const weekNum = wars.length + 1;
    const newEntry = { id: `w${Date.now()}`, weekNumber: weekNum, weekLabel: `Week ${weekNum}`, ...newWAR, status: 'PENDING', comment: '', submittedAt: new Date().toISOString().split('T')[0] };
    setWars(prev => [newEntry, ...prev]);
    setNewWAR({ summary: '', skillsLearned: '', challenges: '' });
    setShowWARForm(false);
    setToast({ message: `Week ${weekNum} WAR submitted successfully!`, type: 'success' });
  };

  const handleCompletionUpload = (field, file) => {
    if (!file) return;
    setCompDocs(prev => ({ ...prev, [field]: file.name, [`${field.replace('certificate', 'certificate').replace('supervisor', 'evaluation')}Status`]: 'UPLOADED' }));
    setToast({ message: `${field === 'certificateOfCompletion' ? 'Certificate of Completion' : 'Supervisor Evaluation'} uploaded!`, type: 'success' });
  };

  const TABS = [
    { id: 'attendance', label: 'Attendance & Logs' },
    { id: 'war', label: 'Weekly Reports (WAR)' },
    { id: 'completion', label: 'Completion Docs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hours Progress */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke={theme.colors.bgSecondary} strokeWidth="10" />
              <circle cx="55" cy="55" r="46" fill="none" stroke={theme.colors.primary} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 46}`} strokeDashoffset={`${2 * Math.PI * 46 * (1 - hoursProgress / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.colors.textMain }}>{totalHours}</span>
              <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>/ {requiredHours} hrs</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: '0 0 6px 0', color: theme.colors.textMain, fontSize: '1.25rem', fontWeight: 700 }}>Internship Progress</h2>
            <p style={{ margin: '0 0 12px 0', color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
              {requiredHours - totalHours > 0 ? `${requiredHours - totalHours} hours remaining to complete.` : 'All required hours completed! Upload your completion documents.'}
            </p>
            <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', overflow: 'hidden', width: '100%', maxWidth: '340px' }}>
              <div style={{ height: '100%', width: `${hoursProgress}%`, backgroundColor: hoursProgress >= 100 ? '#16a34a' : theme.colors.primary, borderRadius: '4px', transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, marginTop: '6px' }}>{hoursProgress.toFixed(1)}% Complete</div>
            {totalHours >= requiredHours && (
              <button onClick={onComplete} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, marginTop: '14px' }}>
                <CheckCircle size={16} /> Mark Internship Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: theme.colors.bgSecondary, padding: '4px', borderRadius: '12px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
              backgroundColor: activeTab === t.id ? '#fff' : 'transparent',
              color: activeTab === t.id ? theme.colors.primary : theme.colors.textMuted,
              boxShadow: activeTab === t.id ? '0 2px 4px rgba(0,0,0,0.06)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ATTENDANCE TAB ── */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ ...commonStyles.dashboardCard, padding: '24px', flex: 1, minWidth: '300px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color={theme.colors.primary} /> Log Today's Attendance
            </h3>
            <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Date</label>
                <input type="date" required style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newLog.date} onChange={e => setNewLog(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Time In</label>
                  <input type="time" required style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newLog.timeIn} onChange={e => setNewLog(p => ({ ...p, timeIn: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Time Out</label>
                  <input type="time" required style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newLog.timeOut} onChange={e => setNewLog(p => ({ ...p, timeOut: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Activities</label>
                <textarea required placeholder="Describe today's tasks and accomplishments..." style={{ ...commonStyles.input, minHeight: '90px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                  value={newLog.activities} onChange={e => setNewLog(p => ({ ...p, activities: e.target.value }))} />
              </div>
              <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, alignSelf: 'flex-start' }}>
                <Clock size={16} /> Log Attendance
              </button>
            </form>
          </div>

          <div style={{ ...commonStyles.dashboardCard, padding: '24px', flex: 1.2, minWidth: '300px', maxHeight: '480px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Attendance History</h3>
            {logs.length === 0 ? (
              <p style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: '40px' }}>No logs recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.map(log => {
                  const st = ATT_STATUS[log.status] || ATT_STATUS.PRESENT;
                  return (
                    <div key={log.id} style={{ padding: '12px 14px', border: `1px solid ${theme.colors.border}`, borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.colors.textMain }}>{log.date}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: st.bg, color: st.color }}>{log.status}</span>
                          <span style={{ fontWeight: 700, color: theme.colors.primary, fontSize: '0.9rem' }}>{log.hours}h</span>
                        </div>
                      </div>
                      {log.status !== 'ABSENT' && (
                        <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{log.timeIn} – {log.timeOut}</div>
                      )}
                      {log.activities && <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: theme.colors.textSecondary }}>{log.activities}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── WAR TAB ── */}
      {activeTab === 'war' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Weekly Activity Reports</h3>
            <button onClick={() => setShowWARForm(p => !p)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
              <Plus size={16} /> New WAR
            </button>
          </div>

          {showWARForm && (
            <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontWeight: 700, color: theme.colors.textMain }}>Week {wars.length + 1} — Weekly Activity Report</h4>
              <form onSubmit={handleSubmitWAR} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { key: 'summary', label: 'Week Summary', placeholder: 'What did you work on this week?', rows: 4 },
                  { key: 'skillsLearned', label: 'Skills Learned', placeholder: 'What new skills or tools did you learn?', rows: 3 },
                  { key: 'challenges', label: 'Challenges Encountered', placeholder: 'What difficulties did you face and how did you address them?', rows: 3 },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: theme.colors.textSecondary, marginBottom: '6px' }}>{f.label}</label>
                    <textarea required rows={f.rows} placeholder={f.placeholder} style={{ ...commonStyles.input, resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                      value={newWAR[f.key]} onChange={e => setNewWAR(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowWARForm(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>Cancel</button>
                  <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
                    <Send size={16} /> Submit WAR
                  </button>
                </div>
              </form>
            </div>
          )}

          {wars.map(war => {
            const st = WAR_STATUS[war.status];
            const isOpen = expandedWAR === war.id;
            return (
              <div key={war.id} style={{ ...commonStyles.dashboardCard, padding: '0', overflow: 'hidden', border: war.status === 'REJECTED' ? '1px solid #fecaca' : `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', cursor: 'pointer', backgroundColor: war.status === 'REJECTED' ? '#fff5f5' : '#fff' }}
                  onClick={() => setExpandedWAR(isOpen ? null : war.id)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                    {st.icon} {st.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: theme.colors.textMain, fontSize: '0.95rem' }}>{war.weekLabel}</div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Submitted: {war.submittedAt}</div>
                  </div>
                  {isOpen ? <ChevronUp size={16} color={theme.colors.textMuted} /> : <ChevronDown size={16} color={theme.colors.textMuted} />}
                </div>
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${theme.colors.border}` }}>
                    {war.status === 'REJECTED' && war.comment && (
                      <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444', margin: '16px 0 12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>OJT Adviser Comment:</div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>{war.comment}</p>
                      </div>
                    )}
                    {war.status === 'APPROVED' && war.comment && (
                      <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a', margin: '16px 0 12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>OJT Adviser Feedback:</div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>{war.comment}</p>
                      </div>
                    )}
                    {[{ label: 'Summary', value: war.summary }, { label: 'Skills Learned', value: war.skillsLearned }, { label: 'Challenges', value: war.challenges }].map(f => (
                      <div key={f.label} style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '4px' }}>{f.label}</div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textMain, lineHeight: 1.6 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── COMPLETION DOCS TAB ── */}
      {activeTab === 'completion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '0.875rem', color: '#92400e' }}>
            ⚠️ These documents can only be uploaded after completing all required OJT hours. Upload both to allow your OJT Adviser to validate your completion.
          </div>
          {[
            { key: 'certificateOfCompletion', label: 'Certificate of Completion', desc: 'Official certificate from your company/supervisor confirming you completed your OJT.' },
            { key: 'supervisorEvaluation', label: 'Supervisor Evaluation Form', desc: 'Evaluation form filled out and signed by your industry supervisor.' },
          ].map(doc => (
            <div key={doc.key} style={{ ...commonStyles.dashboardCard, padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontWeight: 700, color: theme.colors.textMain }}>{doc.label}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>{doc.desc}</p>
                {compDocs[doc.key] && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle size={16} /> {compDocs[doc.key]}
                  </div>
                )}
              </div>
              <div>
                <input type="file" id={`comp-${doc.key}`} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handleCompletionUpload(doc.key, e.target.files[0])} />
                <label htmlFor={`comp-${doc.key}`} style={{ ...commonStyles.dashboardBtn, ...(compDocs[doc.key] ? commonStyles.dashboardBtnSecondary : commonStyles.dashboardBtnPrimary), cursor: 'pointer', display: 'inline-flex', gap: '8px' }}>
                  <Upload size={16} /> {compDocs[doc.key] ? 'Re-upload' : 'Upload'}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
