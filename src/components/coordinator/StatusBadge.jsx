import React from 'react';
import '../../assets/css/coordinator/StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    if (!status) return 'default';
    const lowerStatus = status.toLowerCase();
    if (['placed', 'approved', 'active', 'success', 'accepted'].includes(lowerStatus)) return 'success';
    if (['unplaced', 'pending', 'warning', 'ongoing'].includes(lowerStatus)) return 'warning';
    if (['flagged', 'rejected', 'danger', 'failed'].includes(lowerStatus)) return 'danger';
    if (['completed', 'info', 'graded'].includes(lowerStatus)) return 'info';
    return 'default';
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
