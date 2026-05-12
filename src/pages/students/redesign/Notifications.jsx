import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Unlock
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';

const Notifications = () => {
  const notifications = [
    { type: 'WAR approved', msg: 'Your Week 8 Weekly Activity Report has been approved by the OJT Head.', time: '2 hours ago', icon: CheckCircle2, color: studentDesign.colors.success },
    { type: 'WAR reminder', msg: 'Don\'t forget to submit your Week 9 WAR by the end of the week.', time: '5 hours ago', icon: Calendar, color: studentDesign.colors.warning },
    { type: 'Document rejected', msg: 'Your Resume / CV was rejected due to blurry scan. Please re-upload.', time: 'Yesterday', icon: AlertCircle, color: studentDesign.colors.danger },
    { type: 'Missed attendance', msg: 'You were marked as absent for yesterday\'s log. Please check with your supervisor.', time: '2 days ago', icon: AlertCircle, color: studentDesign.colors.danger },
    { type: 'Stage unlocked', msg: 'Congratulations! Stage 2 — During Internship has been unlocked.', time: '1 week ago', icon: Unlock, color: studentDesign.colors.primary },
  ];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    listCard: {
      ...studentDesign.card,
      padding: '0',
    },
    header: {
      padding: '24px',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    row: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '20px',
      padding: '24px',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
    },
    iconBox: (color) => ({
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: `${color}10`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    type: {
      fontSize: '14px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.textMain,
    },
    message: {
      fontSize: '14px',
      color: studentDesign.colors.textDark,
      lineHeight: '1.5',
    },
    time: {
      fontSize: '12px',
      color: studentDesign.colors.textMuted,
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: studentDesign.colors.primary,
      marginTop: '16px',
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <div style={styles.listCard}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Notifications</h3>
          <button style={{ background: 'none', border: 'none', color: studentDesign.colors.primary, fontWeight: studentDesign.typography.weights.semibold, fontSize: '14px', cursor: 'pointer' }}>Mark all as read</button>
        </div>
        
        {notifications.map((n, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ backgroundColor: '#F8FAFC' }}
            style={{ ...styles.row, borderBottom: idx === notifications.length - 1 ? 'none' : styles.row.borderBottom }}
          >
            <div style={styles.iconBox(n.color)}>
              <n.icon size={20} />
            </div>
            <div style={styles.content}>
              <span style={styles.type}>{n.type}</span>
              <p style={styles.message}>{n.msg}</p>
              <span style={styles.time}>{n.time}</span>
            </div>
            {idx < 2 && <div style={styles.dot} />}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Notifications;
