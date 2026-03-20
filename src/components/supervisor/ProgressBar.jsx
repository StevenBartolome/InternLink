// src/components/supervisor/ProgressBar.jsx
import React from 'react';
import '../../assets/css/supervisor/ProgressBar.css';

const ProgressBar = ({ rendered, required }) => {
  const percentage = Math.min(Math.round((rendered / required) * 100), 100);
  
  const getColor = (percent) => {
    if (percent < 30) return 'progress-low';
    if (percent < 70) return 'progress-medium';
    return 'progress-high';
  };

  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-text">{rendered} / {required} hrs</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div className="progress-track">
        <div 
          className={`progress-fill ${getColor(percentage)}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
