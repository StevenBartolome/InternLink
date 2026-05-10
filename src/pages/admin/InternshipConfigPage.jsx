// src/pages/admin/InternshipConfigPage.jsx
import React, { useState } from 'react';
import { Settings, Clock, FileText, Calendar, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { internshipConfig } from '../../services/mocks/adminMockData';
import Toast from '../../components/common/Toast';

export default function InternshipConfigPage() {
  const [configs, setConfigs] = useState(internshipConfig);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState({});

  const handleSave = (course) => {
    setToast({ message: `Configuration for ${course} saved successfully.`, type: 'success' });
    setExpanded(null);
  };

  const updateConfig = (course, field, value) => {
    setConfigs(prev => prev.map(c => c.course !== course ? c : { ...c, [field]: value }));
  };

  const updateDeadline = (course, key, value) => {
    setConfigs(prev => prev.map(c => c.course !== course ? c : { ...c, deadlines: { ...c.deadlines, [key]: value } }));
  };

  const addDocument = (course, docName) => {
    if (!docName.trim()) return;
    setConfigs(prev => prev.map(c => c.course !== course ? c : { ...c, requiredDocuments: [...c.requiredDocuments, docName] }));
  };

  const removeDocument = (course, idx) => {
    setConfigs(prev => prev.map(c => c.course !== course ? c : { ...c, requiredDocuments: c.requiredDocuments.filter((_, i) => i !== idx) }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Internship Configuration</h1>
        <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Set required OJT hours, document checklists, and submission deadlines per course.</p>
      </div>

      {configs.map(config => {
        const isOpen = expanded === config.course;
        return (
          <div key={config.course} style={{ ...commonStyles.dashboardCard, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', cursor: 'pointer', backgroundColor: isOpen ? theme.colors.bgSecondary : '#fff' }}
              onClick={() => setExpanded(isOpen ? null : config.course)}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#1e40af,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Settings size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: theme.colors.textMain }}>{config.course}</div>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{config.courseFullName} • {config.requiredHours} hours required • {config.requiredDocuments.length} documents</div>
              </div>
              {isOpen ? <ChevronUp size={18} color={theme.colors.textMuted} /> : <ChevronDown size={18} color={theme.colors.textMuted} />}
            </div>

            {isOpen && (
              <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                  {/* Required Hours */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>
                      <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Required OJT Hours
                    </label>
                    <input type="number" min="100" max="1000"
                      style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', fontWeight: 700, fontSize: '1.1rem' }}
                      value={config.requiredHours} onChange={e => updateConfig(config.course, 'requiredHours', parseInt(e.target.value))} />
                  </div>
                  {/* OJT Subject Code */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>OJT Subject Code</label>
                    <input type="text" style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                      value={config.ojtSubjectCode} onChange={e => updateConfig(config.course, 'ojtSubjectCode', e.target.value)} />
                  </div>
                </div>

                {/* Deadlines */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} /> Deadlines
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'docSubmission', label: 'Document Submission' },
                      { key: 'portfolioSubmission', label: 'Portfolio Submission' },
                    ].map(d => (
                      <div key={d.key} style={{ flex: 1, minWidth: '180px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '4px' }}>{d.label}</label>
                        <input type="date" style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                          value={config.deadlines[d.key] || ''}
                          onChange={e => updateDeadline(config.course, d.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Checklist */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={13} /> Required Documents ({config.requiredDocuments.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {config.requiredDocuments.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: theme.colors.bgSecondary, borderRadius: '8px' }}>
                        <span style={{ flex: 1, fontSize: '0.875rem', color: theme.colors.textMain, fontWeight: 500 }}>{doc}</span>
                        <button onClick={() => removeDocument(config.course, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.1rem', lineHeight: 1, padding: '2px' }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input id={`newdoc-${config.course}`} type="text" placeholder="Add a document name..." style={{ ...commonStyles.input, flex: 1 }} />
                    <button onClick={() => { const el = document.getElementById(`newdoc-${config.course}`); addDocument(config.course, el.value); el.value = ''; }}
                      style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flexShrink: 0 }}>
                      + Add
                    </button>
                  </div>
                </div>

                <button onClick={() => handleSave(config.course)}
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, marginTop: '20px' }}>
                  <Save size={16} /> Save Configuration
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
