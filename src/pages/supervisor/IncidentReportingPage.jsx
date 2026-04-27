// src/pages/supervisor/IncidentReportingPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { AlertTriangle, Send, Calendar, User, Info } from 'lucide-react';
import { internsData } from '../../services/mocks/supervisorMockData';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';

const IncidentReportingPage = () => {
  const { showToast } = useOutletContext();
  const [selectedInternId, setSelectedInternId] = useState(internsData[0].id);
  const [incidentType, setIncidentType] = useState('Attendance (e.g., AWOL)');
  const [description, setDescription] = useState('');
  const [incidentHistory, setIncidentHistory] = useState([
    { id: 1, date: '2026-03-15', intern: 'Maria Santos', type: 'Late Attendance', status: 'Resolved' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const internName = internsData.find(i => i.id === parseInt(selectedInternId))?.name || 'Unknown';
    const newIncident = {
      id: incidentHistory.length + 1,
      date: new Date().toISOString().split('T')[0],
      intern: internName,
      type: incidentType,
      status: 'Submitted'
    };

    setIncidentHistory([newIncident, ...incidentHistory]);
    setDescription('');
    showToast('Incident report submitted to School Coordinator');
  };

  const styles = {
    container: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { marginBottom: '8px' },
    title: { fontSize: '24px', fontWeight: 800, color: theme.colors.textMain, margin: '0 0 4px 0' },
    subtitle: { color: theme.colors.textMuted, fontSize: '14px', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' },
    card: { backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadows.sm },
    sectionTitle: { fontSize: '18px', fontWeight: 800, color: theme.colors.textMain, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: 700, color: theme.colors.textMain },
    input: { padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, fontSize: '14px', backgroundColor: theme.colors.bgSecondary, outline: 'none' },
    textarea: { padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, fontSize: '14px', backgroundColor: theme.colors.bgSecondary, resize: 'vertical', outline: 'none', minHeight: '120px' },
    btnSubmit: { padding: '14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
    historyTable: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px', fontSize: '11px', fontWeight: 800, color: theme.colors.textMuted, textTransform: 'uppercase', borderBottom: `1px solid ${theme.colors.border}` },
    td: { padding: '14px', fontSize: '13px', color: theme.colors.textMain, borderBottom: '1px solid #f1f5f9' },
    emptyState: { textAlign: 'center', padding: '48px 24px', color: theme.colors.textMuted },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Incident Reporting</h1>
        <p style={styles.subtitle}>Report severe attendance or behavioral issues directly to the School Coordinator.</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <AlertTriangle color="#ef4444" size={20} /> New Incident Report
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Involved Intern</label>
              <select 
                style={styles.input}
                value={selectedInternId}
                onChange={(e) => setSelectedInternId(e.target.value)}
              >
                {internsData.map(intern => (
                  <option key={intern.id} value={intern.id}>{intern.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Incident Category</label>
              <select 
                style={styles.input}
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              >
                <option>Attendance (e.g., AWOL)</option>
                <option>Performance Issue</option>
                <option>Behavioral / Disciplinary</option>
                <option>Policy Violation</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Detailed Description</label>
              <textarea 
                style={styles.textarea} 
                placeholder="Provide specific details, dates, and times of the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" style={styles.btnSubmit}>
              <Send size={18} /> Submit Report to School
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <Calendar size={20} color={theme.colors.primary} /> Report History
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Intern</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {incidentHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={styles.emptyState}>
                      <Info size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                      <p>No incidents reported yet.</p>
                    </td>
                  </tr>
                ) : (
                  incidentHistory.map(report => (
                    <tr key={report.id}>
                      <td style={styles.td}>{new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{report.intern}</td>
                      <td style={styles.td}>{report.type}</td>
                      <td style={styles.td}><StatusBadge status={report.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportingPage;
