import React from 'react';
import '../../assets/css/coordinator/ProgressBar.css';

const ProgressBar = ({ value, max = 100, showLabel = true, size = 'md' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const getColor = (pct) => {
    if (pct >= 80) return 'success';
    if (pct >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className={`progress-container ${size}`}>
      <div className="progress-track">
        <div 
          className={`progress-fill ${getColor(percentage)}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">{percentage}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
