// src/components/supervisor/ProgressBar.jsx
import React from 'react';
import { theme } from '../../styles/theme';

const ProgressBar = ({ rendered, required }) => {
  const percentage = Math.min(Math.round((rendered / required) * 100), 100);
  
  const getColor = (percent) => {
    if (percent < 30) return theme.colors.danger;
    if (percent < 70) return theme.colors.warning;
    return theme.colors.success;
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      width: '100%',
    },
    info: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    track: {
      height: '6px',
      backgroundColor: theme.colors.border,
      borderRadius: '3px',
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: getColor(percentage),
      transition: 'width 0.4s ease-out',
      width: `${percentage}%`,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <span style={{ fontWeight: 600 }}>{rendered} / {required} hrs</span>
        <span>{percentage}%</span>
      </div>
      <div style={styles.track}>
        <div style={styles.fill} />
      </div>
    </div>
  );
};

export default ProgressBar;
