import React from 'react';
import { theme } from '../../styles/theme';

const ProgressBar = ({ value, max = 100, percentage, completed, total, showLabel = false, size = 'md' }) => {
  const calcPercent = percentage !== undefined 
    ? percentage 
    : value !== undefined ? Math.min(Math.round((value / max) * 100), 100)
    : (completed && total ? Math.min(Math.round((completed / total) * 100), 100) : 0);

  const getColor = (pct) => {
    if (pct >= 80) return theme.colors.success;
    if (pct >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const heightMap = {
    sm: '6px',
    md: '10px',
    lg: '16px'
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
    },
    track: {
      flex: 1,
      backgroundColor: theme.colors.border,
      borderRadius: '9999px',
      overflow: 'hidden',
      height: heightMap[size] || heightMap.md,
    },
    fill: {
      height: '100%',
      borderRadius: '9999px',
      transition: 'width 0.3s ease',
      width: `${calcPercent}%`,
      backgroundColor: getColor(calcPercent),
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.colors.textMuted,
      minWidth: '35px',
      textAlign: 'right',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.track}>
        <div style={styles.fill} />
      </div>
      {showLabel && (
        <span style={styles.label}>{calcPercent}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
