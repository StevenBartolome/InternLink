import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    if (!status) return 'default';
    const lowerStatus = status.toLowerCase();
    if (['placed', 'approved', 'active', 'success', 'accepted', 'completed'].includes(lowerStatus)) return 'success';
    if (['unplaced', 'pending', 'warning', 'ongoing', 'in progress'].includes(lowerStatus)) return 'warning';
    if (['flagged', 'rejected', 'danger', 'failed', 'inactive'].includes(lowerStatus)) return 'danger';
    if (['info', 'graded'].includes(lowerStatus)) return 'info';
    return 'default';
  };

  return (
    <span className={`dashboard-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
