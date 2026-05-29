import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Circle,
  Calendar,
  ChevronRight,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { studentDesign } from '../../../styles/StudentDesign';
import CompanyInfoForm from '../../../components/student/CompanyInfoForm';
import PageLoader from '../../../components/common/PageLoader';
import { attendanceService } from '../../../services/attendanceService';
import { studentService } from '../../../services/studentService';
import { weeklyReportService } from '../../../services/weeklyReportService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showPromptModal, setShowPromptModal] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  // Dynamic Metrics States
  const [logs, setLogs] = React.useState([]);
  const [documents, setDocuments] = React.useState([]);
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user && user.current_stage === 'DURING_INTERNSHIP' && !user.supervisor_name && !sessionStorage.getItem('dismissedSupervisorPrompt')) {
      setShowPromptModal(true);
    }
  }, [user]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.internship_id) return;
      try {
        // Only trigger full screen page loader on first initial load
        if (logs.length === 0 && documents.length === 0 && reports.length === 0) {
          setLoading(true);
        }
        const [fetchedLogs, fetchedDocs, fetchedReports] = await Promise.all([
          attendanceService.getAttendanceLogs(user.internship_id).catch(() => []),
          studentService.getPreInternshipDocuments(user.internship_id).catch(() => []),
          weeklyReportService.getWeeklyReports(user.internship_id).catch(() => [])
        ]);
        setLogs(fetchedLogs);
        setDocuments(fetchedDocs);
        setReports(fetchedReports);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <PageLoader />;
  }
  
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

  // Compute Metrics dynamically
  const loggedLogs = logs.filter(l => l.status === 'LOGGED' || l.status === 'DEDUCTED');
  const uniqueDates = new Set(loggedLogs.map(l => l.log_date));
  const daysPresent = uniqueDates.size;

  const parseReportHours = (doc) => {
    if (!doc || !doc.comment) return 0;
    const match = doc.comment.match(/\[HOURS:([0-9.]+)\]/);
    return match ? parseFloat(match[1]) : 0;
  };

  const uploadedReportHours = documents
    .filter(d => d.name && d.name.startsWith('Signed Attendance Report'))
    .reduce((sum, d) => sum + parseReportHours(d), 0);

  const requiredHours = user?.required_hours || 486;
  const remainingHours = Math.max(0, requiredHours - uploadedReportHours);

  // WARs calculations
  const totalWARs = reports.length;
  const requiredWARs = 12;
  const remainingWARs = Math.max(0, requiredWARs - totalWARs);

  // Present days calculation
  const requiredDays = 60;

  const metrics = [
    { 
      label: 'Hours rendered', 
      value: `${uploadedReportHours.toFixed(1)} / ${requiredHours}`, 
      progress: Math.min(100, (uploadedReportHours / requiredHours) * 100), 
      footer: `${remainingHours.toFixed(1)} hours remaining` 
    },
    { 
      label: 'WARs submitted', 
      value: `${totalWARs} / ${requiredWARs}`, 
      progress: Math.min(100, (totalWARs / requiredWARs) * 100), 
      footer: `${remainingWARs} weeks remaining` 
    },
    { 
      label: 'Days present', 
      value: `${daysPresent} / ${requiredDays}`, 
      progress: Math.min(100, (daysPresent / requiredDays) * 100), 
      footer: `Present: ${daysPresent} days` 
    }
  ];

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now - past;
      if (isNaN(diffMs)) return 'Recent';
      
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const getDynamicNotifications = () => {
    const list = [];

    // 1. Scan Weekly Activity Reports
    reports.forEach(rep => {
      if (rep.status === 'APPROVED') {
        list.push({
          msg: `Weekly Activity Report for Week ${rep.week_number} has been approved.`,
          time: rep.reviewed_at ? formatTimeAgo(rep.reviewed_at) : 'Recent',
          active: false
        });
      } else if (rep.status === 'REJECTED') {
        list.push({
          msg: `Weekly Activity Report for Week ${rep.week_number} was rejected: "${rep.reviewer_comment || 'Please review feedback.'}"`,
          time: rep.reviewed_at ? formatTimeAgo(rep.reviewed_at) : 'Recent',
          active: true
        });
      } else if (rep.status === 'PENDING') {
        list.push({
          msg: `Weekly Activity Report for Week ${rep.week_number} has been submitted and is pending review.`,
          time: rep.submitted_at ? formatTimeAgo(rep.submitted_at) : 'Recent',
          active: false
        });
      }
    });

    // 2. Scan Pre-Internship & Additional Documents
    documents.forEach(doc => {
      const docName = doc.document_name || doc.name || 'Document';
      if (doc.status === 'APPROVED') {
        list.push({
          msg: `Document "${docName}" has been approved by your adviser.`,
          time: doc.reviewed_at ? formatTimeAgo(doc.reviewed_at) : 'Recent',
          active: false
        });
      } else if (doc.status === 'REJECTED') {
        list.push({
          msg: `Document "${docName}" was rejected. Feedback: "${doc.reviewer_comment || 'Please re-upload.'}"`,
          time: doc.reviewed_at ? formatTimeAgo(doc.reviewed_at) : 'Recent',
          active: true
        });
      } else if (doc.status === 'PENDING') {
        list.push({
          msg: `Document "${docName}" has been submitted for review.`,
          time: doc.submitted_at ? formatTimeAgo(doc.submitted_at) : 'Recent',
          active: false
        });
      }
    });

    // 3. Fallbacks if list is empty
    if (list.length === 0) {
      list.push({
        msg: `Welcome to your InternLink Dashboard! Use this panel to track your OJT hours.`,
        time: 'Today',
        active: true
      });
      list.push({
        msg: `Configure your OJT schedule and supervisor details to begin logging attendance.`,
        time: 'Today',
        active: true
      });
    }

    // Sort active notifications first
    return list.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)).slice(0, 3);
  };

  const getWeeklyAttendance = () => {
    const today = new Date();
    // Get Sunday of current week
    const sunday = new Date(today);
    const dayOfWeek = today.getDay();
    sunday.setDate(today.getDate() - dayOfWeek);

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const workDaysConfig = user?.user_metadata?.work_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return weekDays.map((letter, idx) => {
      const currentDate = new Date(sunday);
      currentDate.setDate(sunday.getDate() + idx);
      
      const dateNum = currentDate.getDate();
      const isWeekend = idx === 0 || idx === 6;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isFuture = currentDate > today && !isToday;
      const dayName = fullDayNames[idx];
      const isScheduled = workDaysConfig.includes(dayName);

      // Check if there is an attendance log for this date
      const hasLog = logs.some(log => {
        if (!log.log_date) return false;
        const logDateObj = new Date(log.log_date);
        return logDateObj.toDateString() === currentDate.toDateString();
      });

      let status = 'future';
      if (isToday) {
        status = 'today';
      } else if (hasLog) {
        status = 'present';
      } else if (isWeekend) {
        status = 'weekend';
      } else {
        status = 'future';
      }

      return {
        day: letter,
        dateNumber: dateNum,
        status: status
      };
    });
  };

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
            {getDynamicNotifications().map((n, idx) => (
              <div key={idx} style={styles.notifRow}>
                <div style={styles.notifDot(n.active)} />
                <span style={styles.notifText}>{n.msg}</span>
                <span style={styles.notifTime}>{n.time}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            style={{ ...styles.iconButton, marginTop: '12px', fontSize: '13px', color: studentDesign.colors.primary, fontWeight: studentDesign.typography.weights.semibold, display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            View all notifications <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekly Attendance */}
        <div style={styles.card}>
          <h3 style={styles.listHeader}>This week's attendance</h3>
          <div style={styles.calendarGrid}>
            {getWeeklyAttendance().map((d, idx) => (
              <div key={idx} style={styles.calDay(d.status)}>
                <span style={{ opacity: 0.6, fontSize: '10px' }}>{d.day}</span>
                <span>{d.dateNumber}</span>
              </div>
            ))}
          </div>
          <div style={styles.legend}>
            <div style={styles.legendItem}><div style={styles.legendDot(studentDesign.colors.status.done.bg)} /> Present</div>
            <div style={styles.legendItem}><div style={styles.legendDot(studentDesign.colors.primary)} /> Today</div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/attendance')}
            style={styles.primaryButton}
          >
            Log time-in / time-out
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showPromptModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 40px rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '24px'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FCD34D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
              }}>
                <AlertTriangle size={32} />
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 10px 0',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#1E293B'
                }}>
                  Supervisor Details Needed
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#64748B',
                  lineHeight: 1.6
                }}>
                  You are currently in the <strong>During Internship</strong> stage, but your industry supervisor details are not yet set up. 
                  Please add them to enable daily logs and weekly activity tracking.
                </p>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%'
              }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPromptModal(false);
                    setShowForm(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: studentDesign.colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  Add Supervisor Details Now
                </motion.button>
                
                <button
                  onClick={() => {
                    setShowPromptModal(false);
                    sessionStorage.setItem('dismissedSupervisorPrompt', 'true');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#334155'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showForm && (
        <CompanyInfoForm 
          userId={user.id}
          initialData={user}
          onClose={() => setShowForm(false)}
          onSave={(newData) => {
            setShowForm(false);
            window.location.reload();
          }}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;
