import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Hourglass,
  ArrowUpRight
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';

const Attendance = () => {
  const metrics = [
    { label: 'Total hours rendered', value: '312.5 hrs', icon: Clock, color: studentDesign.colors.primary },
    { label: 'Days present', value: '39 days', icon: Calendar, color: studentDesign.colors.success },
    { label: 'Remaining hours', value: '173.5 hrs', icon: Hourglass, color: studentDesign.colors.warning },
  ];

  const logs = [
    { date: 'May 12, 2026', in: '08:00 AM', out: '--', hours: '4.5', status: 'In progress' },
    { date: 'May 11, 2026', in: '08:00 AM', out: '05:00 PM', hours: '9.0', status: 'Logged' },
    { date: 'May 10, 2026', in: '08:15 AM', out: '05:05 PM', hours: '8.8', status: 'Logged' },
    { date: 'May 09, 2026', in: '--', out: '--', hours: '0.0', status: 'Missed' },
    { date: 'May 08, 2026', in: '07:55 AM', out: '05:00 PM', hours: '9.0', status: 'Logged' },
  ];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
    metricCard: {
      ...studentDesign.card,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    iconBox: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    tableCard: {
      ...studentDesign.card,
      padding: '0',
    },
    tableHeader: {
      padding: '24px',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '16px 24px',
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    td: {
      padding: '16px 24px',
      fontSize: '14px',
      color: studentDesign.colors.textDark,
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    badge: (status) => {
      let colors = studentDesign.colors.status.neutral;
      if (status === 'Logged') colors = studentDesign.colors.status.done;
      if (status === 'In progress') colors = studentDesign.colors.status.active;
      if (status === 'Missed') colors = studentDesign.colors.status.error;
      
      return {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: studentDesign.typography.weights.medium,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={styles.container}
    >
      <div style={styles.metricsGrid}>
        {metrics.map((m, idx) => (
          <div key={idx} style={styles.metricCard}>
            <div style={styles.iconBox(m.color)}>
              <m.icon size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: studentDesign.colors.textMuted }}>{m.label}</span>
              <span style={{ fontSize: '20px', fontWeight: studentDesign.typography.weights.semibold }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Daily log</h3>
          <button style={{ background: 'none', border: 'none', color: studentDesign.colors.primary, fontWeight: studentDesign.typography.weights.semibold, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Export CSV <ArrowUpRight size={16} />
          </button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time in</th>
              <th style={styles.th}>Time out</th>
              <th style={styles.th}>Hours</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} style={{ backgroundColor: log.status === 'In progress' ? '#F8FAFC' : 'transparent' }}>
                <td style={styles.td}>{log.date}</td>
                <td style={styles.td}>{log.in}</td>
                <td style={styles.td}>{log.out}</td>
                <td style={styles.td}>{log.hours}</td>
                <td style={styles.td}>
                  <span style={styles.badge(log.status)}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: studentDesign.colors.textMuted, fontSize: '13px', cursor: 'pointer' }}>View full history</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Attendance;
