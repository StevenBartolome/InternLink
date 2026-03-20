import React from 'react';
import '../../assets/css/students/ProgressBar.css';

const ProgressBar = ({ percentage, completed, total }) => {
  const calculatedPercentage = percentage !== undefined 
    ? percentage 
    : (completed && total ? (completed / total) * 100 : 0);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, calculatedPercentage))}%` }}></div>
    </div>
  );
};

export default ProgressBar;
