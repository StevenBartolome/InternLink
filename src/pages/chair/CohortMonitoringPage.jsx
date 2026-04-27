import React from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { theme } from '../../styles/theme';

const CohortMonitoringPage = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    card: {
      backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f1f5f9' },
    progressBar: { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
    progressFill: (percent) => ({ height: '100%', backgroundColor: theme.colors.primary, width: `${percent}%` }),
    statusBadge: (status) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
      backgroundColor: status === 'Completed' ? '#dcfce7' : status === 'Deployed' ? '#dbeafe' : '#fef3c7',
      color: status === 'Completed' ? '#166534' : status === 'Deployed' ? '#1e40af' : '#b45309',
    })
  };

  const students = [
    { id: 1, name: 'Alice Smith', coord: 'Prof. Davis', company: 'Tech Corp', hours: 300, target: 300, status: 'Completed' },
    { id: 2, name: 'Bob Jones', coord: 'Prof. Wilson', company: 'Global Build', hours: 150, target: 300, status: 'Deployed' },
    { id: 3, name: 'Charlie Brown', coord: 'Prof. Davis', company: 'Pending', hours: 0, target: 300, status: 'Pending' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Cohort Monitoring</h1>
        <p style={styles.subtitle}>Track progress of all students in the current cohort.</p>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <input type="text" placeholder="Search student..." style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }} />
          <select style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <option>All Coordinators</option>
          </select>
          <select style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <option>All Statuses</option>
          </select>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student Name</th>
              <th style={styles.th}>Assigned Coordinator</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Hours Rendered</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{s.name}</td>
                <td style={styles.td}>{s.coord}</td>
                <td style={styles.td}>{s.company}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={styles.progressBar}><div style={styles.progressFill((s.hours/s.target)*100)} /></div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{s.hours}/{s.target}</span>
                  </div>
                </td>
                <td style={styles.td}><span style={styles.statusBadge(s.status)}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CohortMonitoringPage;
