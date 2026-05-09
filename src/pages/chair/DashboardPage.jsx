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
      <style>
        {`
          @keyframes chartFill {
            from { stroke-dasharray: 0, 100; stroke-dashoffset: 0; }
          }
        `}
      </style>
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
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                />
                {/* Placed Segment */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="93.3, 100"
                  style={{ animation: 'chartFill 1s ease-out' }}
                />
                {/* Unplaced Segment */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeDasharray="6.7, 100"
                  strokeDashoffset="-93.3"
                  style={{ animation: 'chartFill 1s ease-out' }}
                />
              </svg>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.textMain }}>93%</span>
                <span style={{ fontSize: '0.9rem', color: theme.colors.textMuted, fontWeight: 600 }}>Placed</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#10b981' }}></div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Placed</div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>420 Students</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#f59e0b' }}></div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Unplaced</div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>30 Students</div>
                </div>
              </div>
            </div>
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
