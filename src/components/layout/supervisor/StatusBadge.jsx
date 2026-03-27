// src/components/supervisor/StatusBadge.jsx
import React from 'react';
import { theme } from '../../styles/theme';

const StatusBadge = ({ status }) => {
  const getStyles = (status) => {
    if (!status) return { backgroundColor: theme.colors.border, color: theme.colors.textMuted };
    const lower = status.toLowerCase();
    
    // Default base styles
    let styles = {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block',
    };

    // Attendance & Task & Evaluation statuses
    if (['present', 'done', 'evaluated'].includes(lower)) {
      styles.backgroundColor = '#dcfce7'; 
      styles.color = '#16a34a';
    } else if (['absent', 'danger'].includes(lower)) {
      styles.backgroundColor = '#fee2e2';
      styles.color = '#dc2626';
    } else if (['late', 'warning'].includes(lower)) {
      styles.backgroundColor = '#fef3c7';
      styles.color = '#d97706';
    } else if (['in progress', 'eligible', 'info'].includes(lower)) {
      styles.backgroundColor = '#eff6ff';
      styles.color = '#2563eb';
    } else {
      styles.backgroundColor = '#f3f4f6';
      styles.color = '#4b5563';
    }
    
    return styles;
  };

  return (
    <span style={getStyles(status)}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
