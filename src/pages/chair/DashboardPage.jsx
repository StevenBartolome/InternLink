import React from 'react';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { theme } from '../../styles/theme';

const DashboardPage = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px' },
    title: { fontSize: '2rem', fontWeight: 800, color: theme.colors.textMain, margin: '0 0 8px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '24px', marginBottom: '32px'
    },
    card: {
      backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '16px'
    },
    iconBox: (color) => ({
      width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${color}20`,
      color: color, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),
    value: { fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 },
    label: { fontSize: '0.875rem', color: theme.colors.textMuted, margin: 0, marginTop: '4px' },
    section: {
      backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '24px'
    },
    sectionTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' },
    actionList: { listStyle: 'none', padding: 0, margin: 0 },
    actionItem: { 
      padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', 
      alignItems: 'center', gap: '12px', fontSize: '0.95rem' 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Program Dashboard</h1>
        <p style={styles.subtitle}>Overview of BS Information Technology cohort</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.iconBox('#3b82f6')}><Users size={24} /></div>
          <div><h3 style={styles.value}>450</h3><p style={styles.label}>Total Enrolled</p></div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#10b981')}><CheckCircle size={24} /></div>
          <div><h3 style={styles.value}>420</h3><p style={styles.label}>Placed Students</p></div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#f59e0b')}><AlertCircle size={24} /></div>
          <div><h3 style={styles.value}>30</h3><p style={styles.label}>Unplaced Students</p></div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#8b5cf6')}><Clock size={24} /></div>
          <div><h3 style={styles.value}>15</h3><p style={styles.label}>Pending Final Grades</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Placement Status</h2>
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ color: theme.colors.textMuted }}>[ Doughnut Chart: Placed vs Unplaced vs Completed ]</p>
          </div>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Action Items</h2>
          <ul style={styles.actionList}>
            <li style={styles.actionItem}>
              <Clock size={18} color="#f59e0b" />
              <strong>15 Final Grades</strong> require approval for graduation.
            </li>
            <li style={styles.actionItem}>
              <AlertCircle size={18} color="#ef4444" />
              <strong>2 Coordinator Bottlenecks</strong> reported (Slow approvals).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
