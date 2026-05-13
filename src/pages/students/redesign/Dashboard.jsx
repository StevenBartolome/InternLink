import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Circle,
  Calendar,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { studentDesign } from '../../../styles/StudentDesign';

const Dashboard = () => {
  const { user } = useAuth();
  
  const currentStage = user?.current_stage || 'PRE_INTERNSHIP';
  const STAGE_LEVELS = {
    'PRE_INTERNSHIP': 1,
    'DURING_INTERNSHIP': 2,
    'POST_INTERNSHIP': 3,
    'COMPLETED': 4
  };
  const currentLevel = STAGE_LEVELS[currentStage] || 1;

  const getStageStatus = (level) => {
    if (currentLevel > level) return 'done';
    if (currentLevel === level) return 'active';
    return 'locked';
  };

  const stages = [
    { label: 'Pre-internship', status: getStageStatus(1) },
    { label: 'During internship', status: getStageStatus(2) },
    { label: 'Post-internship', status: getStageStatus(3) }
  ];

  const metrics = [
    { 
      label: 'Hours rendered', 
      value: '312 / 486', 
      progress: (312/486) * 100, 
      footer: '174 hours remaining' 
    },
    { 
      label: 'WARs submitted', 
      value: '8 / 12', 
      progress: (8/12) * 100, 
      footer: '4 weeks remaining' 
    },
    { 
      label: 'Days present', 
      value: '39 / 60', 
      progress: (39/60) * 100, 
      footer: '1 missed day' 
    }
  ];

  const notifications = [
    { msg: 'Weekly report for Week 8 approved', time: 'Today', active: true },
    { msg: 'Document "Resume" rejected. Please re-upload.', time: 'Fri', active: true },
    { msg: 'You missed attendance last Tuesday', time: 'Mon', active: false },
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const attendanceData = [
    { day: 'S', status: 'weekend' },
    { day: 'M', status: 'present' },
    { day: 'T', status: 'today' },
    { day: 'W', status: 'future' },
    { day: 'T', status: 'future' },
    { day: 'F', status: 'future' },
    { day: 'S', status: 'weekend' },
  ];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    tracker: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      marginBottom: '16px',
    },
    trackerItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      position: 'relative',
      flex: 1,
    },
    trackerCircle: (status) => ({
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      backgroundColor: status === 'done' ? studentDesign.colors.success : (status === 'active' ? studentDesign.colors.primary : '#FFFFFF'),
      border: `2px solid ${status === 'locked' ? studentDesign.colors.border : 'transparent'}`,
      color: status === 'locked' ? studentDesign.colors.textMuted : '#FFFFFF',
    }),
    trackerLine: (status) => ({
      position: 'absolute',
      top: '16px',
      left: 'calc(50% + 16px)',
      width: 'calc(100% - 32px)',
      height: '2px',
      backgroundColor: status === 'done' ? studentDesign.colors.success : studentDesign.colors.border,
      zIndex: 1,
    }),
    trackerLabel: (status) => ({
      fontSize: '13px',
      fontWeight: status === 'active' ? studentDesign.typography.weights.semibold : studentDesign.typography.weights.medium,
      color: status === 'locked' ? studentDesign.colors.textMuted : studentDesign.colors.textMain,
    }),
    metricsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1/3)',
      gap: '24px',
    },
    card: {
      ...studentDesign.card,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    metricValue: {
      fontSize: '28px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMain,
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#F1F5F9',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: (width) => ({
      height: '100%',
      width: `${width}%`,
      backgroundColor: studentDesign.colors.primary,
      borderRadius: '4px',
    }),
    cardFooter: {
      fontSize: '12px',
      color: studentDesign.colors.textMuted,
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 0.8fr',
      gap: '24px',
    },
    listHeader: {
      fontSize: '16px',
      fontWeight: studentDesign.typography.weights.semibold,
      marginBottom: '16px',
    },
    notifRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 0',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    notifDot: (active) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: active ? studentDesign.colors.primary : 'transparent',
      marginTop: '6px',
      flexShrink: 0,
    }),
    notifText: {
      fontSize: '13px',
      color: studentDesign.colors.textDark,
      flex: 1,
      lineHeight: '1.4',
    },
    notifTime: {
      fontSize: '12px',
      color: studentDesign.colors.textMuted,
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      marginBottom: '16px',
    },
    calDay: (status) => ({
      height: '36px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.medium,
      backgroundColor: status === 'present' ? studentDesign.colors.status.done.bg : (status === 'today' ? studentDesign.colors.primary : (status === 'missed' ? studentDesign.colors.status.error.bg : 'transparent')),
      color: status === 'today' ? '#FFFFFF' : (status === 'present' ? studentDesign.colors.status.done.text : (status === 'future' || status === 'weekend' ? studentDesign.colors.textMuted : studentDesign.colors.textMain)),
      border: status === 'today' ? 'none' : `1px solid ${studentDesign.colors.border}`,
    }),
    legend: {
      display: 'flex',
      gap: '12px',
      fontSize: '11px',
      color: studentDesign.colors.textMuted,
      marginTop: '8px',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    legendDot: (color) => ({
      width: '8px',
      height: '8px',
      borderRadius: '2px',
      backgroundColor: color,
    }),
    primaryButton: {
      width: '100%',
      padding: '12px',
      borderRadius: '12px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      marginTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      {/* Stage Tracker */}
      <div style={styles.tracker}>
        {stages.map((stage, idx) => (
          <div key={idx} style={styles.trackerItem}>
            <div style={styles.trackerCircle(stage.status)}>
              {stage.status === 'done' ? <CheckCircle2 size={18} /> : (stage.status === 'active' ? <Circle size={18} fill="currentColor" /> : <Lock size={16} />)}
            </div>
            <span style={styles.trackerLabel(stage.status)}>{stage.label}</span>
            {idx < stages.length - 1 && <div style={styles.trackerLine(stage.status)} />}
          </div>
        ))}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {metrics.map((m, idx) => (
          <div key={idx} style={styles.card}>
            <span style={{ fontSize: '14px', fontWeight: studentDesign.typography.weights.medium, color: studentDesign.colors.textMuted }}>{m.label}</span>
            <span style={styles.metricValue}>{m.value}</span>
            <div style={styles.progressBar}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${m.progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                style={styles.progressFill(m.progress)} 
              />
            </div>
            <span style={styles.cardFooter}>{m.footer}</span>
          </div>
        ))}
      </div>

      {/* Grid Two Columns */}
      <div style={styles.gridTwo}>
        {/* Recent Notifications */}
        <div style={styles.card}>
          <h3 style={styles.listHeader}>Recent notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, idx) => (
              <div key={idx} style={styles.notifRow}>
                <div style={styles.notifDot(n.active)} />
                <span style={styles.notifText}>{n.msg}</span>
                <span style={styles.notifTime}>{n.time}</span>
              </div>
            ))}
          </div>
          <button style={{ ...styles.iconButton, marginTop: '12px', fontSize: '13px', color: studentDesign.colors.primary, fontWeight: studentDesign.typography.weights.semibold, display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer' }}>
            View all notifications <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekly Attendance */}
        <div style={styles.card}>
          <h3 style={styles.listHeader}>This week's attendance</h3>
          <div style={styles.calendarGrid}>
            {attendanceData.map((d, idx) => (
              <div key={idx} style={styles.calDay(d.status)}>
                <span style={{ opacity: 0.6, fontSize: '10px' }}>{d.day}</span>
                <span>{10 + idx}</span>
              </div>
            ))}
          </div>
          <div style={styles.legend}>
            <div style={styles.legendItem}><div style={styles.legendDot(studentDesign.colors.status.done.bg)} /> Present</div>
            <div style={styles.legendItem}><div style={styles.legendDot(studentDesign.colors.primary)} /> Today</div>
            <div style={styles.legendItem}><div style={styles.legendDot(studentDesign.colors.status.error.bg)} /> Missed</div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={styles.primaryButton}
          >
            Log time-in / time-out
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
