import React from 'react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    if (!status) return commonStyles.badgeDefault;
    const lowerStatus = status.toLowerCase();
    if (['placed', 'approved', 'active', 'success', 'accepted', 'completed'].includes(lowerStatus)) return commonStyles.badgeSuccess;
    if (['unplaced', 'pending', 'warning', 'ongoing', 'in progress'].includes(lowerStatus)) return commonStyles.badgeWarning;
    if (['flagged', 'rejected', 'danger', 'failed', 'inactive'].includes(lowerStatus)) return commonStyles.badgeDanger;
    if (['info', 'graded', 'info'].includes(lowerStatus)) return commonStyles.badgeInfo;
    return commonStyles.badgeDefault;
  };

  const styles = {
    badge: {
      ...commonStyles.dashboardBadge,
      ...getStatusStyle(status),
    }
  };

  return (
    <span style={styles.badge}>
      {status}
    </span>
  );
};

export default StatusBadge;
