import React from 'react';
import { 
  Clock, CheckCircle, AlertCircle, 
  Calendar, MapPin, User,
  FileText, Download, Play,
  BarChart3, MoreVertical, Plus
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { progressState } from '../../data/mockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternshipProgressPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const hoursPercent = Math.round((progressState.hoursCompleted / progressState.hoursTotal) * 100);

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
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Internship Progress</h1>
        <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
          <Plus size={18} /> Log Weekly Hours
        </button>
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
                    <span style={{ fontSize: '0.8rem', color: theme.colors.success, fontWeight: 600 }}>{log.supervisorSign}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{log.hours} Hours recorded</div>
                  <button style={{ marginTop: '12px', width: '100%', padding: '8px', border: `1px solid ${theme.colors.border}`, borderRadius: '6px', background: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>
                    View Log
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipProgressPage;
