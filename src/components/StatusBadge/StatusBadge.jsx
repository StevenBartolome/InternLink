import React from 'react';
import '../../assets/css/students/StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'active' || s === 'completed') return 'status-success';
    if (s === 'pending' || s === 'in progress') return 'status-warning';
    if (s === 'rejected' || s === 'inactive') return 'status-danger';
    return 'status-default';
  };

  return <span className={`status-badge ${getStatusClass(status)}`}>{status}</span>;
};

export default StatusBadge;
