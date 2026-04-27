import React from 'react';
import { theme } from '../../styles/theme';
import { AlertTriangle, Send } from 'lucide-react';

const IncidentReportingPage = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    card: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 600 },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' },
    btnSubmit: { padding: '12px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    historyTable: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f1f5f9' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Incident Reporting</h1>
        <p style={styles.subtitle}>Report severe attendance or behavioral issues directly to the School Coordinator.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle color="#ef4444" /> New Report
          </h2>
          <form>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Intern</label>
              <select style={styles.input}>
                <option>John Doe</option>
                <option>Jane Smith</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Incident Type</label>
              <select style={styles.input}>
                <option>Attendance (e.g., AWOL)</option>
                <option>Performance Issue</option>
                <option>Behavioral / Disciplinary</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea rows="4" style={styles.input} placeholder="Provide details of the incident..."></textarea>
            </div>
            <button type="button" style={styles.btnSubmit}>
              <Send size={18} /> Submit Report to School
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 20px 0' }}>Report History</h2>
          <table style={styles.historyTable}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Intern</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No past incidents reported.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportingPage;
