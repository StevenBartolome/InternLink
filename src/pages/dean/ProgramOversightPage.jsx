// src/pages/dean/ProgramOversightPage.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Eye, GraduationCap, Users, CheckCircle2 } from 'lucide-react';
import { theme } from '../../styles/theme';

const ProgramOversightPage = () => {
  const { showToast } = useOutletContext() || {};

  const styles = {
    container: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { marginBottom: '8px' },
    title: { fontSize: '2rem', fontWeight: 800, color: theme.colors.textMain, margin: '0 0 4px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '24px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '16px', borderBottom: '2px solid #f1f5f9', color: theme.colors.textMuted, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' },
    td: { padding: '20px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: theme.colors.textMain },
    programName: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700 },
    actionBtn: {
      padding: '8px 16px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 700,
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
    }
  };

  const programs = [
    { id: 1, name: 'BS Information Technology', chair: 'Dr. Alan Turing', enrolled: 450, placed: 420, avgGrade: '1.25', icon: <GraduationCap size={20} /> },
    { id: 2, name: 'BS Computer Science', chair: 'Dr. Ada Lovelace', enrolled: 380, placed: 365, avgGrade: '1.50', icon: <Users size={20} /> },
    { id: 3, name: 'BS Civil Engineering', chair: 'Engr. John Roebling', enrolled: 520, placed: 480, avgGrade: '1.75', icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Program Oversight</h1>
        <p style={styles.subtitle}>Analyze placement performance and student satisfaction across your school's programs.</p>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600, color: theme.colors.textMain, outline: 'none' }}>
              <option>AY 2026-2027</option>
              <option>AY 2025-2026</option>
            </select>
            <select style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600, color: theme.colors.textMain, outline: 'none' }}>
              <option>1st Semester</option>
              <option>2nd Semester</option>
              <option>Summer Term</option>
            </select>
          </div>
          <button 
            style={{ ...styles.actionBtn, backgroundColor: theme.colors.primary, color: '#fff' }}
            onClick={() => showToast && showToast('Refreshing program data...', 'info')}
          >
            Refresh Analytics
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Program Name</th>
                <th style={styles.th}>Program Chair</th>
                <th style={styles.th}>Enrolled</th>
                <th style={styles.th}>Placed (%)</th>
                <th style={styles.th}>Avg Grade</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(prog => (
                <tr key={prog.id} style={{ transition: 'background-color 0.2s' }}>
                  <td style={styles.td}>
                    <div style={styles.programName}>
                      <div style={{ color: theme.colors.primary }}>{prog.icon}</div>
                      {prog.name}
                    </div>
                  </td>
                  <td style={styles.td}>{prog.chair}</td>
                  <td style={styles.td}>{prog.enrolled}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: theme.colors.success }}>{Math.round((prog.placed / prog.enrolled) * 100)}%</span>
                      <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>({prog.placed}/{prog.enrolled})</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ padding: '4px 10px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '8px', fontWeight: 700 }}>
                      {prog.avgGrade}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      style={styles.actionBtn}
                      onClick={() => showToast && showToast(`Opening detailed analytics for ${prog.name}...`, 'info')}
                    >
                      <Eye size={16} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramOversightPage;
