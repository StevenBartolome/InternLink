// src/components/supervisor/StatusBadge.jsx
import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    const lower = status.toLowerCase();
    
    // Attendance statuses
    if (lower === 'present') return 'status-success';
    if (lower === 'absent') return 'status-danger';
    if (lower === 'late') return 'status-warning';
    if (lower === 'no log') return 'status-neutral';
    
    // Task statuses
    if (lower === 'done') return 'status-success';
    if (lower === 'in progress') return 'status-info';
    if (lower === 'not started') return 'status-neutral';
    
    // Evaluation statuses
    if (lower === 'evaluated') return 'status-success';
    if (lower === 'eligible') return 'status-info';
    
    return 'status-default';
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status;
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;
