import React from 'react';
import '../../assets/css/students/ProgressBar.css';

const ProgressBar = ({ value, max = 100, percentage, completed, total, showLabel = false, size = 'md' }) => {
  const calcPercent = percentage !== undefined 
    ? percentage 
    : value !== undefined ? Math.min(Math.round((value / max) * 100), 100)
    : (completed && total ? Math.min(Math.round((completed / total) * 100), 100) : 0);

  const getColor = (pct) => {
    if (pct >= 80) return 'success';
    if (pct >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className={`progress-container ${size}`}>
      <div className="progress-track">
        <div 
          className={`progress-fill ${getColor(calcPercent)}`} 
          style={{ width: `${calcPercent}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">{calcPercent}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
