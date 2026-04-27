import React from 'react';
import { Download, Building } from 'lucide-react';
import { theme } from '../../styles/theme';

const PartnershipReportsPage = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
    statusBadge: (status) => ({
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      backgroundColor: status === 'Active' ? '#dcfce7' : '#fee2e2',
      color: status === 'Active' ? '#166534' : '#991b1b',
    }),
    btn: {
      padding: '10px 20px',
      backgroundColor: theme.colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontWeight: 600
    }
  };

  const partners = [
    { id: 1, company: 'Tech Corp Inc.', interns: 145, status: 'Active', expiry: '2028-05-10' },
    { id: 2, company: 'Global Build Constructors', interns: 89, status: 'Active', expiry: '2027-11-20' },
    { id: 3, company: 'Data Systems Ltd.', interns: 42, status: 'Expiring', expiry: '2026-06-15' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Partnership Reports</h1>
          <p style={styles.subtitle}>Overview of active MoAs and MoUs with industry partners.</p>
        </div>
        <button style={styles.btn}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Total Interns Placed</th>
              <th style={styles.th}>MoA Status</th>
              <th style={styles.th}>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id}>
                <td style={{ ...styles.td, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={16} color={theme.colors.textMuted} /> {p.company}
                </td>
                <td style={styles.td}>{p.interns}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(p.status)}>{p.status}</span>
                </td>
                <td style={styles.td}>{p.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnershipReportsPage;
