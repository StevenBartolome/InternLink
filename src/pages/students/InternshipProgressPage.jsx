import React, { useState } from 'react';
import { 
  Clock, CheckCircle, AlertCircle, 
  Calendar, MapPin, User,
  FileText, Download, Play,
  BarChart3, MoreVertical, Plus,
  XCircle, Save
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { progressState as initialProgressState } from '../../services/mocks/mockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternshipProgressPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [progressState, setProgressState] = useState(initialProgressState);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ hours: '', activities: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hoursPercent = Math.round((progressState.hoursCompleted / progressState.hoursTotal) * 100);

  const handleLogSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const logEntry = {
        week: progressState.weeklyLogs.length + 1,
        hours: parseInt(newLog.hours),
        activities: newLog.activities,
        supervisorSign: "Pending"
      };
      
      setProgressState(prev => ({
        ...prev,
        hoursCompleted: prev.hoursCompleted + logEntry.hours,
        weeklyLogs: [logEntry, ...prev.weeklyLogs]
      }));
      
      setNewLog({ hours: '', activities: '' });
      setIsSubmitting(false);
      setShowLogForm(false);
    }, 800);
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
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '24px',
    },
    card: {
      ...commonStyles.dashboardCard,
    },
    progressHero: {
      ...commonStyles.dashboardCard,
      background: theme.gradients.primary,
      color: '#fff',
      padding: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: theme.colors.bgSecondary,
      marginBottom: '12px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '32px',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '500px',
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '0.95rem',
      outline: 'none',
      backgroundColor: '#f8fafc',
      marginTop: '6px',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: 700,
      color: theme.colors.textMuted,
      display: 'block',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Internship Progress</h1>
      </header>

      <div style={styles.progressHero}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>{progressState.company}</h2>
          <div style={{ display: 'flex', gap: '16px', opacity: 0.9, fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> {progressState.supervisor}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Started {progressState.startDate}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{hoursPercent}%</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{progressState.hoursCompleted} / {progressState.hoursTotal} hrs</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.card}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Task Assignments</h3>
              <BarChart3 size={18} color={theme.colors.primary} />
            </div>
            <div style={{ padding: '20px' }}>
              {progressState.tasks.map(task => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={{ color: task.status === 'Done' ? theme.colors.success : theme.colors.primary }}>
                    {task.status === 'Done' ? <CheckCircle size={20} /> : <Play size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{task.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Task History</h3>
              <Clock size={18} color={theme.colors.textMuted} />
            </div>
            <div style={{ padding: '20px' }}>
              {[
                { id: 101, title: "Initial Project Onboarding", date: "Mar 11, 2026", duration: "4h" },
                { id: 102, title: "Environment Configuration & Repo Access", date: "Mar 12, 2026", duration: "6h" },
                { id: 103, title: "UI Component Library Review", date: "Mar 15, 2026", duration: "8h" }
              ].map(historyTask => (
                <div key={historyTask.id} style={{ ...styles.taskItem, backgroundColor: '#fcfcfc', border: `1px solid ${theme.colors.bgSecondary}` }}>
                  <div style={{ color: theme.colors.success }}>
                    <CheckCircle size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{historyTask.title}</div>
                    <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted }}>Completed on {historyTask.date} • {historyTask.duration} logged</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.card}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}` }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Weekly Logs</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {progressState.weeklyLogs.map((log, i) => (
                <div key={i} style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Week {log.week}</span>
                    <span style={{ fontSize: '0.8rem', color: log.supervisorSign === 'Signed' ? theme.colors.success : theme.colors.warning, fontWeight: 600 }}>
                      {log.supervisorSign}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{log.hours} Hours recorded</div>
                  <button 
                    onClick={() => setSelectedLog(log)}
                    style={{ marginTop: '12px', width: '100%', padding: '8px', border: `1px solid ${theme.colors.border}`, borderRadius: '6px', background: 'none', fontSize: '0.8rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    View Log
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Log Modal */}
      {selectedLog && (
        <div style={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedLog(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
            >
              <XCircle size={24} />
            </button>

            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 800 }}>Week {selectedLog.week} Log</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: theme.colors.bgSecondary, borderRadius: '16px' }}>
                <div style={{ ...styles.label, marginBottom: '4px' }}>Hours Logged</div>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: theme.colors.primary }}>{selectedLog.hours} hrs</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: theme.colors.bgSecondary, borderRadius: '16px' }}>
                <div style={{ ...styles.label, marginBottom: '4px' }}>Supervisor Sign-off</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: selectedLog.supervisorSign === 'Signed' ? theme.colors.success : theme.colors.warning }}>
                  {selectedLog.supervisorSign}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700 }}>Activities & Accomplishments</h4>
              <p style={{ margin: 0, color: theme.colors.textMain, lineHeight: 1.6, fontSize: '0.95rem', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${theme.colors.border}` }}>
                {selectedLog.activities}
              </p>
            </div>

            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, width: '100%', marginTop: '32px', padding: '14px' }}
              onClick={() => setSelectedLog(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Log Hours Form Modal */}
      {showLogForm && (
        <div style={styles.modalOverlay} onClick={() => !isSubmitting && setShowLogForm(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowLogForm(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
              disabled={isSubmitting}
            >
              <XCircle size={24} />
            </button>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>Log Weekly Hours</h2>
            <p style={{ margin: '0 0 24px 0', color: theme.colors.textMuted, fontSize: '0.9rem' }}>
              Record your activities and hours for Week {progressState.weeklyLogs.length + 1}.
            </p>

            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={styles.label}>Hours Logged</label>
                <input 
                  type="number" 
                  min="1" 
                  max="40"
                  required
                  style={styles.input} 
                  placeholder="e.g., 40"
                  value={newLog.hours}
                  onChange={(e) => setNewLog({...newLog, hours: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label style={styles.label}>Activities & Accomplishments</label>
                <textarea 
                  required
                  style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }} 
                  placeholder="Describe what you worked on this week..."
                  value={newLog.activities}
                  onChange={(e) => setNewLog({...newLog, activities: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1, padding: '14px' }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, padding: '14px', opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : <><Save size={18} /> Submit Log</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipProgressPage;
