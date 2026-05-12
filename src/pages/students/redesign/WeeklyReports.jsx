import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';

const WeeklyReports = () => {
  const reports = [
    { week: 'Week 8 WAR', date: 'May 04 - May 08', status: 'Approved' },
    { week: 'Week 7 WAR', date: 'Apr 27 - May 01', status: 'Approved' },
    { week: 'Week 6 WAR', date: 'Apr 20 - Apr 24', status: 'Rejected' },
    { week: 'Week 5 WAR', date: 'Apr 13 - Apr 17', status: 'Pending' },
    { week: 'Week 4 WAR', date: 'Apr 06 - Apr 10', status: 'Approved' },
  ];

  const getStatusStyle = (status) => {
    if (status === 'Approved') return studentDesign.colors.status.done;
    if (status === 'Pending') return studentDesign.colors.status.active;
    if (status === 'Rejected') return studentDesign.colors.status.error;
    return studentDesign.colors.status.neutral;
  };

  const getStatusIcon = (status) => {
    if (status === 'Approved') return <CheckCircle2 size={16} color={studentDesign.colors.success} />;
    if (status === 'Pending') return <Clock size={16} color={studentDesign.colors.primary} />;
    if (status === 'Rejected') return <XCircle size={16} color={studentDesign.colors.danger} />;
    return null;
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    submitButton: {
      padding: '10px 20px',
      borderRadius: '12px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    },
    alert: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      borderRadius: '12px',
      backgroundColor: '#FFFBEB',
      border: '1px solid #FEF3C7',
      color: '#92400E',
    },
    listCard: {
      ...studentDesign.card,
      padding: '8px 24px',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 0',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    info: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: studentDesign.colors.bgSecondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekLabel: {
      fontSize: '15px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMain,
    },
    dateRange: {
      fontSize: '12px',
      color: studentDesign.colors.textMuted,
      marginTop: '2px',
    },
    badge: (status) => {
      const colors = getStatusStyle(status);
      return {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: studentDesign.typography.weights.semibold,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.container}
    >
      <div style={styles.header}>
        <h2 style={{ fontSize: '18px', fontWeight: studentDesign.typography.weights.semibold }}>Weekly Activity Reports</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.submitButton}
        >
          <Plus size={18} /> Submit WAR
        </motion.button>
      </div>

      <div style={styles.alert}>
        <AlertTriangle size={20} />
        <div style={{ fontSize: '14px' }}>
          <strong>Reminder:</strong> Week 9 WAR has not been submitted yet. Please submit by Friday.
        </div>
      </div>

      <div style={styles.listCard}>
        {reports.map((report, idx) => (
          <div key={idx} style={{ ...styles.row, borderBottom: idx === reports.length - 1 ? 'none' : styles.row.borderBottom }}>
            <div style={styles.info}>
              <div style={styles.iconBox}>
                {getStatusIcon(report.status)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={styles.weekLabel}>{report.week}</span>
                <span style={styles.dateRange}>{report.date}</span>
              </div>
            </div>
            <div style={styles.badge(report.status)}>
              {report.status}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeeklyReports;
