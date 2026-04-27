// src/pages/supervisor/AttendanceLogPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, Calendar, Check, AlertCircle, Save, Edit2, X } from 'lucide-react';
import { internsData } from '../../services/mocks/supervisorMockData';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const AttendanceLogPage = () => {
  const { showToast } = useOutletContext();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [selectedInternId, setSelectedInternId] = useState(internsData[0].id);
  const [isTimedIn, setIsTimedIn] = useState(false);
  const [todayLog, setTodayLog] = useState({ timeIn: '---', timeOut: '---', totalHours: 0 });
  const [manualLog, setManualLog] = useState({ date: '', timeIn: '', timeOut: '' });
  const [attendanceLogs, setAttendanceLogs] = useState(internsData[0].attendanceLogs);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const selectedIntern = internsData.find(i => i.id === parseInt(selectedInternId));

  const handleInternChange = (id) => {
    const internId = parseInt(id);
    setSelectedInternId(internId);
    const intern = internsData.find(i => i.id === internId);
    setAttendanceLogs(intern.attendanceLogs);
    setEditingIndex(null);
  };

  const handleTimeToggle = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    
    if (!isTimedIn) {
      setTodayLog({ ...todayLog, timeIn: timeStr });
      setIsTimedIn(true);
      showToast(`Timed in at ${timeStr}`);
    } else {
      const newLog = { 
        date: dateStr, 
        timeIn: todayLog.timeIn, 
        timeOut: timeStr, 
        totalHours: 8, 
        status: "Present" 
      };
      setAttendanceLogs([newLog, ...attendanceLogs]);
      setTodayLog({ ...todayLog, timeOut: timeStr, totalHours: 8 });
      setIsTimedIn(false);
      showToast(`Timed out at ${timeStr}. Attendance logged.`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const newLog = { 
      date: manualLog.date, 
      timeIn: manualLog.timeIn, 
      timeOut: manualLog.timeOut, 
      totalHours: 8, 
      status: "Present" 
    };
    setAttendanceLogs([newLog, ...attendanceLogs]);
    showToast(`Manual log saved for ${selectedIntern.name} on ${manualLog.date}`);
    setManualLog({ date: '', timeIn: '', timeOut: '' });
  };

  const startEdit = (idx, log) => {
    setEditingIndex(idx);
    setEditData({ ...log });
  };

  const saveEdit = () => {
    const updated = [...attendanceLogs];
    updated[editingIndex] = { ...editData };
    setAttendanceLogs(updated);
    setEditingIndex(null);
    showToast("Attendance record updated successfully");
  };

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: '24px',
    },
    selectorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    select: {
      padding: '10px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      fontWeight: 600,
      color: theme.colors.textMain,
      backgroundColor: theme.colors.bgSecondary,
      cursor: 'pointer',
      flex: 1,
      maxWidth: '400px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr',
      gap: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    clockDisplay: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '20px',
      marginBottom: '20px',
    },
    currentDate: {
      fontSize: '16px',
      fontWeight: 700,
      color: theme.colors.primary,
    },
    logSummary: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '24px',
    },
    logBox: {
      padding: '16px',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '16px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    logLabel: {
      fontSize: '11px',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
    },
    logTime: {
      fontSize: '18px',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    toggleBtn: (timedIn) => ({
      width: '100%',
      padding: '16px',
      borderRadius: '16px',
      border: 'none',
      backgroundColor: timedIn ? theme.colors.danger : theme.colors.success,
      color: theme.colors.white,
      fontSize: '16px',
      fontWeight: 800,
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: theme.shadows.sm,
    }),
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.bgSecondary,
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    submitBtn: {
      ...commonStyles.buttonPrimary,
      padding: '14px',
      borderRadius: '14px',
      fontSize: '14px',
      fontWeight: 700,
    },
    tableHeaderRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    renderedBadge: {
      backgroundColor: '#eff6ff',
      padding: '8px 16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.primary,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '14px',
      fontSize: '11px',
      fontWeight: 800,
      textAlign: 'left',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    td: {
      padding: '14px',
      fontSize: '13px',
      color: theme.colors.textMain,
      borderBottom: `1px solid #f1f5f9`,
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Selector Card */}
      <div style={styles.card}>
        <div style={styles.selectorRow}>
          <label style={styles.label}>Select Intern:</label>
          <select 
            value={selectedInternId} 
            onChange={(e) => handleInternChange(e.target.value)}
            style={styles.select}
          >
            {internsData.map(intern => (
              <option key={intern.id} value={intern.id}>{intern.name} ({intern.school})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left: Tracker & Manual Entry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tracker Card */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}><Clock size={20} /> Today's Tracker</h3>
            <div style={styles.clockDisplay}>
              <span style={styles.currentDate}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <div style={styles.logSummary}>
              <div style={styles.logBox}>
                <span style={styles.logLabel}>Time In</span>
                <span style={styles.logTime}>{todayLog.timeIn}</span>
              </div>
              <div style={styles.logBox}>
                <span style={styles.logLabel}>Time Out</span>
                <span style={styles.logTime}>{todayLog.timeOut}</span>
              </div>
            </div>

            <button 
              style={styles.toggleBtn(isTimedIn)}
              onClick={handleTimeToggle}
            >
              {isTimedIn ? 'Time Out' : 'Time In'}
            </button>
          </div>

          {/* Manual Entry Card */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}><AlertCircle size={20} /> Manual Log Correction</h3>
            <form onSubmit={handleManualSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input 
                  type="date" 
                  value={manualLog.date} 
                  onChange={(e) => setManualLog({ ...manualLog, date: e.target.value })}
                  style={styles.input}
                  required 
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time In</label>
                  <input 
                    type="time" 
                    value={manualLog.timeIn} 
                    onChange={(e) => setManualLog({ ...manualLog, timeIn: e.target.value })}
                    style={styles.input}
                    required 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time Out</label>
                  <input 
                    type="time" 
                    value={manualLog.timeOut} 
                    onChange={(e) => setManualLog({ ...manualLog, timeOut: e.target.value })}
                    style={styles.input}
                    required 
                  />
                </div>
              </div>
              <button type="submit" style={styles.submitBtn}>
                <Save size={18} style={{ marginRight: '8px' }} /> Save Correction
              </button>
            </form>
          </div>
        </div>

        {/* Right: Monthly Log Table */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={styles.card}>
            <div style={styles.tableHeaderRow}>
              <h3 style={styles.sectionTitle}><Calendar size={20} /> Monthly Attendance Logs</h3>
              <div style={styles.renderedBadge}>
                <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Total Hours:</span>
                <span style={{ fontSize: '18px', fontWeight: 800 }}>{selectedIntern.renderedHours}h</span>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Time In</th>
                    <th style={styles.th}>Time Out</th>
                    <th style={styles.th}>Hours</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>
                        {editingIndex === idx ? (
                          <input 
                            type="date" 
                            value={editData.date} 
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            style={{ ...styles.input, padding: '4px 8px' }}
                          />
                        ) : (
                          new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingIndex === idx ? (
                          <input 
                            type="text" 
                            value={editData.timeIn} 
                            onChange={(e) => setEditData({ ...editData, timeIn: e.target.value })}
                            style={{ ...styles.input, padding: '4px 8px', width: '80px' }}
                          />
                        ) : log.timeIn}
                      </td>
                      <td style={styles.td}>
                        {editingIndex === idx ? (
                          <input 
                            type="text" 
                            value={editData.timeOut} 
                            onChange={(e) => setEditData({ ...editData, timeOut: e.target.value })}
                            style={{ ...styles.input, padding: '4px 8px', width: '80px' }}
                          />
                        ) : log.timeOut}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>
                        {editingIndex === idx ? (
                          <input 
                            type="number" 
                            value={editData.totalHours} 
                            onChange={(e) => setEditData({ ...editData, totalHours: e.target.value })}
                            style={{ ...styles.input, padding: '4px 8px', width: '50px' }}
                          />
                        ) : (log.totalHours > 0 ? `${log.totalHours}h` : '---')}
                      </td>
                      <td style={styles.td}>
                        {editingIndex === idx ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveEdit} style={{ border: 'none', background: 'none', color: theme.colors.success, cursor: 'pointer' }}><Check size={18} /></button>
                            <button onClick={() => setEditingIndex(null)} style={{ border: 'none', background: 'none', color: theme.colors.danger, cursor: 'pointer' }}><X size={18} /></button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <StatusBadge status={log.status} />
                            <button 
                              onClick={() => startEdit(idx, log)}
                              style={{ border: 'none', background: 'none', color: theme.colors.primary, cursor: 'pointer', marginLeft: '12px' }}
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogPage;
