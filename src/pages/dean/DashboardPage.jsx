// src/pages/dean/DashboardPage.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Building, TrendingUp, AlertCircle, Download, Calendar } from 'lucide-react';
import { theme } from '../../styles/theme';

const DashboardPage = () => {
  const { showToast } = useOutletContext() || {};

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      margin: 0,
      fontSize: '0.95rem',
    },
    btnExport: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: theme.colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '24px',
    },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      border: '1px solid #f1f5f9',
    },
    iconBox: (color) => ({
      width: '56px',
      height: '56px',
      borderRadius: '16px',
      backgroundColor: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    value: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    label: {
      fontSize: '0.9rem',
      color: theme.colors.textMuted,
      margin: 0,
      marginTop: '4px',
    },
    chartSection: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f1f5f9',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    chartArea: {
      height: '300px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      padding: '20px 40px',
      gap: '40px',
      borderBottom: '2px solid #f1f5f9',
    },
    barWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      height: '100%',
      justifyContent: 'flex-end',
    },
    bar: (height, color) => ({
      width: '100%',
      maxWidth: '60px',
      height: `${height}%`,
      backgroundColor: color,
      borderRadius: '12px 12px 4px 4px',
      transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      boxShadow: `0 4px 12px ${color}30`,
    }),
    barLabel: {
      fontSize: '0.85rem',
      fontWeight: 700,
      color: theme.colors.textMain,
    }
  };

  const chartData = [
    { label: 'BSIT', value: 92, color: '#3b82f6' },
    { label: 'BSCS', value: 85, color: '#8b5cf6' },
    { label: 'BSCE', value: 78, color: '#10b981' },
    { label: 'BSBA', value: 65, color: '#f59e0b' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>School Dashboard</h1>
          <p style={styles.subtitle}>Performance metrics across Engineering & Technology programs</p>
        </div>
        <button 
          style={styles.btnExport}
          onClick={() => showToast && showToast('Generating School Performance Report PDF...', 'info')}
        >
          <Download size={18} /> Export PDF Report
        </button>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.iconBox('#3b82f6')}>
            <Users size={28} />
          </div>
          <div>
            <h3 style={styles.value}>1,245</h3>
            <p style={styles.label}>Total Enrolled</p>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#10b981')}>
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 style={styles.value}>94%</h3>
            <p style={styles.label}>Placement Rate</p>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#8b5cf6')}>
            <Building size={28} />
          </div>
          <div>
            <h3 style={styles.value}>182</h3>
            <p style={styles.label}>Partner Companies</p>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.iconBox('#f59e0b')}>
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 style={styles.value}>4.8/5</h3>
            <p style={styles.label}>Satisfaction Score</p>
          </div>
        </div>
      </div>

      <div style={styles.chartSection}>
        <div style={styles.sectionTitle}>
          <Calendar size={20} color={theme.colors.primary} />
          Program Placement Comparison (%)
        </div>
        <div style={styles.chartArea}>
          {chartData.map((data, i) => (
            <div key={i} style={styles.barWrapper}>
              <div style={styles.bar(data.value, data.color)}>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: data.color
                }}>{data.value}%</div>
              </div>
              <span style={styles.barLabel}>{data.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.chartSection, backgroundColor: '#fef2f2', borderColor: '#fee2e2' }}>
        <h2 style={{ ...styles.sectionTitle, color: '#dc2626', marginBottom: '12px' }}>
          <AlertCircle size={20} /> Critical Escalations
        </h2>
        <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.95rem', fontWeight: 500 }}>
          MoA with "Global Tech Solutions" is expiring in 12 days. Action required for 38 active placements.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
