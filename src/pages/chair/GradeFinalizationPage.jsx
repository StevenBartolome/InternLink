import React from 'react';
import { theme } from '../../styles/theme';
import { CheckCircle, XCircle } from 'lucide-react';

const GradeFinalizationPage = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    card: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f1f5f9' },
    btnApprove: { padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnReturn: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
  };

  const pendingGrades = [
    { id: 1, name: 'Alice Smith', coord: '1.25', sup: '4.8/5' },
    { id: 2, name: 'Bob Jones', coord: '1.50', sup: '4.5/5' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Grade Finalization</h1>
          <p style={styles.subtitle}>Review and approve final grades recommended by OJT Coordinators.</p>
        </div>
        <button style={{ padding: '10px 20px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Bulk Approve Selected
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}><input type="checkbox" /></th>
              <th style={styles.th}>Student Name</th>
              <th style={styles.th}>Coordinator Grade</th>
              <th style={styles.th}>Supervisor Eval</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingGrades.map(g => (
              <tr key={g.id}>
                <td style={styles.td}><input type="checkbox" /></td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{g.name}</td>
                <td style={styles.td}><span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontWeight: 'bold' }}>{g.coord}</span></td>
                <td style={styles.td}>{g.sup}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.btnApprove}><CheckCircle size={16} /> Approve</button>
                    <button style={styles.btnReturn}><XCircle size={16} /> Return</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeFinalizationPage;
