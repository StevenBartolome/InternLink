import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Hourglass,
  ArrowUpRight,
  Play,
  Square,
  AlertTriangle,
  Loader2,
  FileText,
  XCircle,
  Pencil,
  Check
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import Toast from '../../../components/common/Toast';
import PageLoader from '../../../components/common/PageLoader';

const Attendance = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activitiesInput, setActivitiesInput] = useState('');
  const [toast, setToast] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [missedLog, setMissedLog] = useState(null);       // stale IN_PROGRESS from a past day
  const [missedClockOut, setMissedClockOut] = useState('17:00'); // default retroactive time
  const [editingLog, setEditingLog] = useState(null);      // id of row currently being edited
  const [editForm, setEditForm] = useState({});            // { timeIn, timeOut, activities }

  const internshipId = user?.internship_id;
  const requiredHours = user?.required_hours || 486;
  const isDeployed = user?.is_deployed;

  // 1. Fetch Logs on Load — depend only on stable primitive values, NOT the whole user object
  useEffect(() => {
    if (!internshipId) return; // user not loaded yet, wait
    if (isDeployed) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [internshipId, isDeployed]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const allLogs = await attendanceService.getAttendanceLogs(internshipId);
      setLogs(allLogs);

      const today = await attendanceService.getTodayLog(internshipId);
      setTodayLog(today);
      if (today && today.status === 'IN_PROGRESS') {
        setActivitiesInput(today.activities || '');
      }

      // Detect stale IN_PROGRESS log from a PREVIOUS day (forgot to clock out)
      const todayStr = new Date().toLocaleDateString('en-CA');
      const staleLog = allLogs.find(
        l => l.status === 'IN_PROGRESS' && l.log_date !== todayStr
      );
      setMissedLog(staleLog || null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setToast({ message: 'Failed to load attendance logs.', type: 'error' });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 2. Ticker Hook for Clock-In Time
  useEffect(() => {
    if (!todayLog || todayLog.status !== 'IN_PROGRESS') return;

    const updateTicker = () => {
      const diffMs = new Date() - new Date(todayLog.time_in);
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
      const hrs = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      setElapsedTime(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [todayLog]);

  // 3. Handle Clock In
  const handleClockIn = async () => {
    if (!internshipId) return;
    try {
      setActionLoading(true);
      const newEntry = await attendanceService.clockIn(internshipId);
      setTodayLog(newEntry);
      setToast({ message: '📅 Clocked in successfully! Keep up the great work today!', type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      console.error('Clock in error:', err);
      setToast({ message: 'Failed to clock in: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Handle Clock Out
  const handleClockOut = async () => {
    if (!todayLog || !internshipId) return;
    try {
      setActionLoading(true);
      const res = await attendanceService.clockOut(
        todayLog.id,
        internshipId,
        todayLog.time_in
      );
      setTodayLog(res.log);
      setToast({ message: `🔒 Clocked out! ${res.log.hours_rendered} hrs saved. Use Resume if you clocked out by mistake.`, type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      console.error('Clock out error:', err);
      setToast({ message: 'Failed to clock out: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 4b. (Removed — accidental clock-out now handled by clocking in again as a new session)

  // 5. Handle Missed / Retroactive Clock-Out
  const handleMissedClockOut = async () => {
    if (!missedLog || !internshipId) return;
    try {
      setActionLoading(true);
      // Build a retroactive time_out ISO string on the missed date
      const retroTimeOut = new Date(`${missedLog.log_date}T${missedClockOut}:00`).toISOString();
      const diffMs = new Date(retroTimeOut) - new Date(missedLog.time_in);
      const hoursRendered = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

      const { supabase } = await import('../../../services/supabaseClient');
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          time_out: retroTimeOut,
          hours_rendered: hoursRendered,
          status: 'LOGGED',
          updated_at: new Date().toISOString()
        })
        .eq('id', missedLog.id);

      if (updateError) throw updateError;

      // Re-sum all hours and update student_internships
      const { data: allLogs, error: fetchError } = await supabase
        .from('attendance_logs')
        .select('hours_rendered')
        .eq('internship_id', internshipId)
        .eq('status', 'LOGGED');

      if (fetchError) throw fetchError;

      const totalHours = allLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
      await supabase
        .from('student_internships')
        .update({ rendered_hours: Math.round(totalHours), updated_at: new Date().toISOString() })
        .eq('id', internshipId);

      setMissedLog(null);
      setToast({ message: `✅ Missed clock-out resolved! ${hoursRendered} hours saved for ${missedLog.log_date}.`, type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      console.error('Retroactive clock-out error:', err);
      setToast({ message: 'Failed to resolve missed clock-out: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Handle inline log edit save
  const handleEditSave = async (log) => {
    try {
      setActionLoading(true);
      const startIso = new Date(`${log.log_date}T${editForm.timeIn}:00`).toISOString();
      const endIso   = new Date(`${log.log_date}T${editForm.timeOut}:00`).toISOString();
      const diffMs   = new Date(endIso) - new Date(startIso);
      const hrs      = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

      const { supabase } = await import('../../../services/supabaseClient');
      const { error } = await supabase
        .from('attendance_logs')
        .update({
          time_in: startIso,
          time_out: endIso,
          hours_rendered: hrs,
          activities: editForm.activities,
          updated_at: new Date().toISOString()
        })
        .eq('id', log.id);

      if (error) throw error;

      // Re-sum total hours
      const { data: allLogs } = await supabase
        .from('attendance_logs')
        .select('hours_rendered')
        .eq('internship_id', internshipId)
        .eq('status', 'LOGGED');

      const total = (allLogs || []).reduce((s, l) => s + (l.hours_rendered || 0), 0);
      await supabase
        .from('student_internships')
        .update({ rendered_hours: Math.round(total), updated_at: new Date().toISOString() })
        .eq('id', internshipId);

      setEditingLog(null);
      setToast({ message: `✏️ Log updated — ${hrs.toFixed(2)} hrs recorded.`, type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      setToast({ message: 'Failed to save edit: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Handle CSV Export
  const handleExportCSV = () => {
    if (logs.length === 0) {
      setToast({ message: 'No logs available to export.', type: 'warning' });
      return;
    }

    const headers = ['Date', 'Time In', 'Time Out', 'Hours Rendered', 'Status', 'Tasks / Activities'];
    const rows = logs.map(l => [
      l.log_date,
      l.time_in ? new Date(l.time_in).toLocaleTimeString() : '--',
      l.time_out ? new Date(l.time_out).toLocaleTimeString() : '--',
      l.hours_rendered.toFixed(2),
      l.status,
      `"${(l.activities || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OJT_Attendance_Logs_${user?.student_id || 'Student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 8. Compute Metrics
  const loggedLogs = logs.filter(l => l.status === 'LOGGED');
  const totalRendered = loggedLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
  const daysPresent = loggedLogs.length;
  const remainingHours = Math.max(0, requiredHours - totalRendered);

  // Format decimal hours → "8h 30m"
  const fmtHours = (decHours) => {
    const h = Math.floor(decHours);
    const m = Math.round((decHours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const metrics = [
    { label: 'Total hours rendered', value: fmtHours(totalRendered), icon: Clock, color: studentDesign.colors.primary },
    { label: 'Days present', value: `${daysPresent} days`, icon: Calendar, color: studentDesign.colors.success },
    { label: 'Remaining hours', value: fmtHours(remainingHours), icon: Hourglass, color: studentDesign.colors.warning },
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
      if (status === 'LOGGED') colors = studentDesign.colors.status.done;
      if (status === 'IN_PROGRESS') colors = studentDesign.colors.status.active;
      if (status === 'MISSED') colors = studentDesign.colors.status.error;
      
      return {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: studentDesign.typography.weights.medium,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      };
    },
    clockPanel: {
      ...studentDesign.card,
      background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      color: '#fff',
      padding: '32px',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(30, 58, 138, 0.25)',
    }
  };

  // Locked State for Un-deployed Students
  if (!user?.is_deployed) {
    return (
      <div style={{ ...studentDesign.card, textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '600px' }}>
        <AlertTriangle size={48} color={studentDesign.colors.warning} style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: studentDesign.colors.textMain }}>Attendance Tracker Locked</h3>
        <p style={{ color: studentDesign.colors.textMuted, maxWidth: '440px', margin: '8px auto 0', fontSize: '14px', lineHeight: 1.5 }}>
          You must be approved for deployment (Stage 2) by your OJT Adviser to begin logging your daily attendance hours.
        </p>
      </div>
    );
  }

  if (loading) return <PageLoader message="Loading your attendance records..." />;

  const isClockedIn = todayLog && todayLog.status === 'IN_PROGRESS';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={styles.container}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Missed Clock-Out Warning Banner ── */}
      {missedLog && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px solid #FDBA74',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.10)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: '#FED7AA', border: '1px solid #FB923C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#EA580C', flexShrink: 0
          }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#9A3412' }}>
              Missed Clock-Out Detected!
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#C2410C', lineHeight: 1.5 }}>
              You forgot to clock out on <strong>{new Date(missedLog.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
              Enter your actual clock-out time below to save your hours.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clock-out time</label>
                <input
                  type="time"
                  value={missedClockOut}
                  onChange={e => setMissedClockOut(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px',
                    border: '1px solid #FDBA74', backgroundColor: '#fff',
                    fontSize: '14px', fontWeight: 600, color: '#7C2D12',
                    outline: 'none', cursor: 'pointer'
                  }}
                />
              </div>
              <button
                disabled={actionLoading}
                onClick={handleMissedClockOut}
                style={{
                  marginTop: '16px', padding: '10px 18px', borderRadius: '10px',
                  backgroundColor: '#EA580C', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2410C'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA580C'}
              >
                {actionLoading ? <Loader2 size={14} /> : <XCircle size={14} />}
                Save & Close Missed Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Clock In/Out Panel */}
      <div style={styles.clockPanel}>
        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.05, color: '#fff' }}>
          <Clock size={240} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', zIndex: 2 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>OJT Time Tracker</h2>
            <p style={{ margin: '4px 0 0', color: '#93c5fd', fontSize: '14px' }}>
              {isClockedIn
                ? '🔴 Attendance is active. Your hours are currently ticking!'
                : '👋 Ready to start your shift? Click Clock In to begin. You can clock in multiple times per day.'}
            </p>
          </div>

          {isClockedIn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '14px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                {elapsedTime}
              </span>
            </div>
          )}
        </div>


        <div style={{ zIndex: 2, display: 'flex', gap: '12px' }}>
          {isClockedIn ? (
            <button
              disabled={actionLoading}
              onClick={handleClockOut}
              style={{
                backgroundColor: '#ef4444', color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Square size={18} fill="#fff" />}
              Clock Out &amp; Save Shift
            </button>
          ) : (
            <button
              disabled={actionLoading}
              onClick={handleClockIn}
              style={{
                backgroundColor: '#3b82f6', color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="#fff" />}
              Clock In Shift
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
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

      {/* Daily Logs History Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: studentDesign.colors.textMain }}>Daily Log History</h3>
          <button 
            onClick={handleExportCSV}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: studentDesign.colors.primary, 
              fontWeight: studentDesign.typography.weights.semibold, 
              fontSize: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}
          >
            Export CSV <ArrowUpRight size={16} />
          </button>
        </div>
        {logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: studentDesign.colors.textMuted }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.15 }} />
            <p style={{ fontWeight: 600, fontSize: '15px', margin: 0 }}>No shift attendance logs recorded yet.</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Your completed shift hours will appear here after you clock out.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time in</th>
                <th style={styles.th}>Time out</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => {
                const isEditing = editingLog === log.id;
                return (
                  <tr key={idx} style={{ backgroundColor: log.status === 'IN_PROGRESS' ? '#F8FAFC' : (isEditing ? '#EFF6FF' : 'transparent') }}>
                    {/* Date */}
                    <td style={styles.td}>
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    {/* Time In */}
                    <td style={styles.td}>
                      {isEditing ? (
                        <input type="time" value={editForm.timeIn}
                          onChange={e => setEditForm(f => ({ ...f, timeIn: e.target.value }))}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${studentDesign.colors.border}`, fontSize: '13px' }} />
                      ) : (
                        log.time_in ? new Date(log.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'
                      )}
                    </td>
                    {/* Time Out */}
                    <td style={styles.td}>
                      {isEditing ? (
                        <input type="time" value={editForm.timeOut}
                          onChange={e => setEditForm(f => ({ ...f, timeOut: e.target.value }))}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${studentDesign.colors.border}`, fontSize: '13px' }} />
                      ) : (
                        log.time_out ? new Date(log.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'
                      )}
                    </td>
                    {/* Duration */}
                    <td style={styles.td}>
                      {log.status === 'IN_PROGRESS' ? '--' : fmtHours(log.hours_rendered || 0)}
                    </td>
                    {/* Status */}
                    <td style={styles.td}>
                      <span style={styles.badge(log.status)}>
                        {log.status === 'IN_PROGRESS' ? 'In progress' : 'Logged'}
                      </span>
                    </td>
                    {/* Edit */}
                    <td style={styles.td}>
                      {log.status === 'LOGGED' && (
                        isEditing ? (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleEditSave(log)}
                            title="Save changes"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '4px' }}
                          >
                            {actionLoading ? <Loader2 size={16} /> : <Check size={16} />}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingLog(log.id);
                              setEditForm({
                                timeIn:  log.time_in  ? new Date(log.time_in).toTimeString().slice(0,5)  : '08:00',
                                timeOut: log.time_out ? new Date(log.time_out).toTimeString().slice(0,5) : '17:00',
                                activities: log.activities || ''
                              });
                            }}
                            title="Edit this log"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: studentDesign.colors.textMuted, padding: '4px' }}
                          >
                            <Pencil size={15} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Dynamic Keyframe Injection for Glowing Red Pulsing Dot */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </motion.div>
  );
};

export default Attendance;
