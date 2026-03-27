// src/pages/supervisor/InternDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, GraduationCap, Calendar, 
  CheckSquare, FileSignature, Clock 
} from 'lucide-react';
import { internsData } from '../../data/supervisorMockData';
import StatusBadge from '../../components/supervisor/StatusBadge';
import ProgressBar from '../../components/supervisor/ProgressBar';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const intern = internsData.find(i => i.id === parseInt(id));

  if (!intern) {
    return (
      <div style={{ ...commonStyles.flexCenter, height: '80vh', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: theme.colors.textMain, fontWeight: 800 }}>Intern Not Found</h2>
        <button 
          style={{ ...commonStyles.buttonSecondary, display: 'flex', alignItems: 'center', gap: '8px' }} 
          onClick={() => navigate('/supervisor/interns')}
        >
          <ArrowLeft size={18} /> Back to My Interns
        </button>
      </div>
    );
  }

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      marginBottom: '8px',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      color: theme.colors.textMuted,
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      padding: '8px 0',
      transition: 'color 0.2s',
      ':hover': { color: theme.colors.primary }
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr',
      gap: '24px',
      alignItems: 'start',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      paddingBottom: '24px',
      borderBottom: `1px solid ${theme.colors.border}`,
      marginBottom: '24px',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '24px',
      objectFit: 'cover',
      border: `3px solid ${theme.colors.bgSecondary}`,
    },
    profileTitle: {
      flex: 1,
    },
    profileName: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    profileCourse: {
      fontSize: '14px',
      color: theme.colors.textMuted,
      fontWeight: 600,
    },
    profileStatus: {
      alignSelf: 'flex-start',
    },
    profileBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    infoIcon: {
      color: theme.colors.primary,
      backgroundColor: '#eff6ff',
      padding: '8px',
      borderRadius: '10px',
      flexShrink: 0,
    },
    infoContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    infoLabel: {
      fontSize: '11px',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 16px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    hoursStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '16px',
    },
    hoursBox: (bg, color) => ({
      backgroundColor: bg,
      padding: '12px',
      borderRadius: '16px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }),
    hourVal: {
      fontSize: '18px',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    hourLabel: {
      fontSize: '10px',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
    },
    actionBtn: (isPrimary) => ({
      ... (isPrimary ? commonStyles.buttonPrimary : commonStyles.buttonSecondary),
      padding: '12px 24px',
      borderRadius: '14px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
    }),
    sectionHeaderRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    textBtn: {
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontWeight: 700,
      fontSize: '13px',
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '12px',
      fontSize: '11px',
      fontWeight: 800,
      textAlign: 'left',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    td: {
      padding: '12px',
      fontSize: '13px',
      color: theme.colors.textMain,
      borderBottom: `1px solid #f1f5f9`,
    },
    taskItem: {
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
    },
    taskName: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.colors.textMain,
      marginBottom: '2px',
    },
    taskDesc: {
      fontSize: '12px',
      color: theme.colors.textMuted,
      lineHeight: 1.4,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/supervisor/interns')}>
          <ArrowLeft size={16} /> Back to My Interns
        </button>
      </div>

      <div style={styles.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile Card */}
          <div style={styles.card}>
            <div style={styles.profileHeader}>
              <img src={intern.photo} alt={intern.name} style={styles.profilePhoto} />
              <div style={styles.profileTitle}>
                <h1 style={styles.profileName}>{intern.name}</h1>
                <span style={styles.profileCourse}>{intern.course}</span>
              </div>
              <div style={styles.profileStatus}>
                <StatusBadge status={intern.todayStatus} />
              </div>
            </div>
            
            <div style={styles.profileBody}>
              <div style={styles.infoRow}>
                <GraduationCap size={18} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>School</span>
                  <span style={styles.infoValue}>{intern.school}</span>
                </div>
              </div>
              <div style={styles.infoRow}>
                <Phone size={18} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>Contact Info</span>
                  <span style={styles.infoValue}>{intern.contact}</span>
                </div>
              </div>
              <div style={styles.infoRow}>
                <Mail size={18} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>Email Address</span>
                  <span style={styles.infoValue}>intern@{intern.school.toLowerCase().replace(/\s/g, '')}.edu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>OJT Hours Summary</h3>
            <div style={{ margin: '20px 0' }}>
              <ProgressBar rendered={intern.renderedHours} required={intern.requiredHours} />
            </div>
            <div style={styles.hoursStats}>
              <div style={styles.hoursBox('#f8fafc', theme.colors.textMain)}>
                <span style={styles.hourVal}>{intern.requiredHours}</span>
                <span style={styles.hourLabel}>Required</span>
              </div>
              <div style={styles.hoursBox('#eff6ff', theme.colors.primary)}>
                <span style={styles.hourVal}>{intern.renderedHours}</span>
                <span style={styles.hourLabel}>Rendered</span>
              </div>
              <div style={styles.hoursBox('#fff7ed', '#f97316')}>
                <span style={styles.hourVal}>{intern.requiredHours - intern.renderedHours}</span>
                <span style={styles.hourLabel}>Remaining</span>
              </div>
            </div>
          </div>

          {/* Evaluation Card */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Performance Evaluation</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <StatusBadge status={intern.evaluationStatus} />
              {intern.evaluationStatus === 'Evaluated' && (
                <div style={{ fontWeight: 800, fontSize: '18px', color: '#16a34a' }}>
                  Score: <span style={{ fontSize: '24px' }}>{intern.evaluation?.overallScore}</span>
                </div>
              )}
            </div>
            <button 
              style={styles.actionBtn(intern.evaluationStatus !== 'Evaluated')}
              onClick={() => intern.evaluationStatus !== 'Evaluated' && navigate('/supervisor/evaluation')}
            >
              {intern.evaluationStatus === 'Evaluated' ? 'View Full Evaluation' : 'Evaluate Intern Now'}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Attendance Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}><Clock size={18} /> Recent Attendance</h3>
              <button style={styles.textBtn} onClick={() => navigate('/supervisor/attendance')}>
                Manage Logs
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>In</th>
                    <th style={styles.th}>Out</th>
                    <th style={styles.th}>Hrs</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {intern.attendanceLogs.slice(0, 5).map((log, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td style={styles.td}>{log.timeIn}</td>
                      <td style={styles.td}>{log.timeOut}</td>
                      <td style={styles.td}>{log.totalHours}h</td>
                      <td style={styles.td}><StatusBadge status={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tasks Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}><CheckSquare size={18} /> Assigned Tasks</h3>
              <button style={styles.textBtn} onClick={() => navigate('/supervisor/tasks')}>
                Manage Tasks
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {intern.tasks.map((task) => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.taskName}>{task.name}</div>
                    <div style={styles.taskDesc}>{task.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: theme.colors.textMuted }}>
                      Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDetailPage;
