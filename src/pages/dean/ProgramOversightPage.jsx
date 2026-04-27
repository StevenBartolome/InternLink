import React from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { theme } from '../../styles/theme';

const ProgramOversightPage = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f1f5f9' },
    actionBtn: {
      background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600
    }
  };

  const programs = [
    { id: 1, name: 'BS Information Technology', chair: 'Dr. Alan Turing', enrolled: 450, placed: 420, avgGrade: '1.25' },
    { id: 2, name: 'BS Computer Science', chair: 'Dr. Ada Lovelace', enrolled: 380, placed: 365, avgGrade: '1.50' },
    { id: 3, name: 'BS Civil Engineering', chair: 'Engr. John Roebling', enrolled: 520, placed: 480, avgGrade: '1.75' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Program Oversight</h1>
        <p style={styles.subtitle}>Compare and analyze performance across academic programs.</p>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <select style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <option>Academic Year 2026-2027</option>
          </select>
          <select style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <option>All Terms</option>
          </select>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Program Name</th>
              <th style={styles.th}>Program Chair</th>
              <th style={styles.th}>Enrolled</th>
              <th style={styles.th}>Placed</th>
              <th style={styles.th}>Avg Grade</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(prog => (
              <tr key={prog.id}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{prog.name}</td>
                <td style={styles.td}>{prog.chair}</td>
                <td style={styles.td}>{prog.enrolled}</td>
                <td style={styles.td}>{prog.placed}</td>
                <td style={styles.td}>{prog.avgGrade}</td>
                <td style={styles.td}>
                  <button style={styles.actionBtn}>
                    <Eye size={16} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramOversightPage;
