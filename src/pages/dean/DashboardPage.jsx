import React from 'react';
import { Users, Building, TrendingUp, AlertCircle } from 'lucide-react';
import { theme } from '../../styles/theme';

const DashboardPage = () => {
  const styles = {
    container: {
      padding: '20px',
    },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 8px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      margin: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconBox: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: `${color}20`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    value: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    label: {
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
      margin: 0,
      marginTop: '4px',
    },
    section: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      marginBottom: '16px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>School Dashboard</h1>
        <p style={styles.subtitle}>High-level overview of all programs and partnerships</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.iconBox('#3b82f6')}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={styles.value}>1,245</h3>
            <p style={styles.label}>Total Active Interns</p>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#10b981')}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={styles.value}>92%</h3>
            <p style={styles.label}>Placement Rate</p>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#8b5cf6')}>
            <Building size={24} />
          </div>
          <div>
            <h3 style={styles.value}>156</h3>
            <p style={styles.label}>Partner Companies</p>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#ef4444')}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 style={styles.value}>4.5/5</h3>
            <p style={styles.label}>Avg Evaluation Score</p>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Program Comparison (Mock Data)</h2>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ color: theme.colors.textMuted }}>[ Bar Chart Component: BSIT vs BSCE vs BSCS Placement Rates ]</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Escalations</h2>
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <AlertCircle size={18} />
            MoA Expiring Soon
          </div>
          <p style={{ margin: '8px 0 0 26px', fontSize: '0.9rem' }}>
            Partnership agreement with "Tech Innovators Inc." expires in 15 days. Affects 42 current interns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
