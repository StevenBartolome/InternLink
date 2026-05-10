import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, 
  Calendar, GraduationCap, Building2,
  CheckCircle2, Clock, FileText,
  Award, Star, ExternalLink, Github
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockStudents } from '../../services/mocks/ojtProfessorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('overview');

  // Find student and their progress
  const student = mockStudents.find(s => s.id === id);
  const progress = mockStudents.find(s => s.id === id);

  if (!student) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Student not found</h2>
        <button onClick={() => navigate(-1)} style={commonStyles.dashboardBtn}>Go Back</button>
      </div>
    );
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '8px',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      color: theme.colors.textMuted,
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 500,
      padding: '8px 0',
      transition: 'color 0.2s',
      ':hover': { color: theme.colors.primary }
    },
    profileCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: '32px',
      padding: '32px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '30px',
      objectFit: 'cover',
      border: `4px solid ${theme.colors.bgAccent}`,
    },
    tabBar: {
      display: 'flex',
      gap: '24px',
      borderBottom: `1px solid ${theme.colors.border}`,
      paddingBottom: '2px',
    },
    tab: (isActive) => ({
      padding: '12px 16px',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      borderBottom: `2px solid ${isActive ? theme.colors.primary : 'transparent'}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '24px',
    },
    sectionCard: {
      ...commonStyles.dashboardCard,
      padding: '24px',
      height: '100%',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px',
    },
    iconBox: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    label: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: '2px',
    },
    value: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: theme.colors.textMain,
    },
    badge: {
      ...commonStyles.dashboardBadge,
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      marginRight: '6px',
      marginBottom: '6px',
      display: 'inline-block',
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      th: {
        textAlign: 'left',
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
      },
      td: {
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: '0.875rem',
        color: theme.colors.textMain,
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Header & Back Button */}
      <div>
        <button style={{ ...styles.backBtn, marginBottom: '8px' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back to Students
        </button>
        <div style={styles.header}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Student Profile</h1>
        </div>
      </div>

      {/* Profile Info Header */}
      <div style={styles.profileCard}>
        <img src={student.avatar} alt={student.name} style={styles.avatar} />
        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{student.name}</h2>
            <StatusBadge status={student.status} />
          </div>
          <p style={{ color: theme.colors.textMuted, fontSize: '1rem', margin: '0 0 16px 0' }}>
            {student.id} • {student.course} ({student.yearLevel})
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
              onClick={() => showToast && showToast(`Downloading ${student.name}'s resume...`, 'success')}
            >
              <FileText size={16} /> View Resume
            </button>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
              onClick={() => showToast && showToast('Emailing student...', 'info')}
            >
              <Mail size={16} /> Contact Student
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <div style={styles.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</div>
        <div style={styles.tab(activeTab === 'progress')} onClick={() => setActiveTab('progress')}>Internship Progress</div>
        <div style={styles.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>Task History</div>
      </div>

      {/* Content Based on Tab */}
      {activeTab === 'overview' && (
        <div style={styles.grid}>
          {/* General Information */}
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>General Information</h3>
            <div style={styles.infoItem}>
              <div style={styles.iconBox}><GraduationCap size={18} /></div>
              <div>
                <div style={styles.label}>Academic Status</div>
                <div style={styles.value}>{student.course} • {student.yearLevel}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.iconBox}><Star size={18} /></div>
              <div>
                <div style={styles.label}>Skills & Expertise</div>
                <div>
                  {student.skills.map((skill, i) => (
                    <span key={i} style={styles.badge}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Placement Information */}
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>Placement Information</h3>
            {student.company ? (
              <>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Building2 size={18} /></div>
                  <div>
                    <div style={styles.label}>Assigned Company</div>
                    <div style={styles.value}>{student.company}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Award size={18} /></div>
                  <div>
                    <div style={styles.label}>Supervisor</div>
                    <div style={styles.value}>{student.supervisor || 'Not assigned'}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: theme.colors.textMuted }}>
                <p>No placement data available yet.</p>
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
                  onClick={() => navigate('/ojt-professor/matching')}
                >
                  Match with Employers
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div style={styles.container}>
          {progress ? (
            <>
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>OJT Hours Tracking</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={styles.value}>Hours Rendered: {progress.hoursRendered} / {progress.hoursRequired}</span>
                  <span style={{ ...styles.value, color: theme.colors.primary }}>{Math.round((progress.hoursRendered / progress.hoursRequired) * 100)}% Complete</span>
                </div>
                <ProgressBar value={progress.hoursRendered} max={progress.hoursRequired} size="lg" />
                
                <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
                  <div>
                    <div style={styles.label}>Attendance Rate</div>
                    <div style={{ ...styles.value, fontSize: '1.25rem', color: theme.colors.success }}>{progress.attendanceRate}</div>
                  </div>
                  <div>
                    <div style={styles.label}>Tasks Completed</div>
                    <div style={{ ...styles.value, fontSize: '1.25rem', color: theme.colors.primary }}>{progress.taskCompletionRate}</div>
                  </div>
                  <div>
                    <div style={styles.label}>Last Active</div>
                    <div style={{ ...styles.value, fontSize: '1.25rem' }}>{progress.lastActivityDate}</div>
                  </div>
                </div>
              </div>

              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>Recent Attendance Logs</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.table.th}>Date</th>
                        <th style={styles.table.th}>Time In</th>
                        <th style={styles.table.th}>Time Out</th>
                        <th style={styles.table.th}>Hours</th>
                        <th style={styles.table.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.attendanceLogs.map((log, i) => (
                        <tr key={i}>
                          <td style={styles.table.td}>{log.date}</td>
                          <td style={styles.table.td}>{log.timeIn}</td>
                          <td style={styles.table.td}>{log.timeOut}</td>
                          <td style={styles.table.td}>{log.hours}h</td>
                          <td style={styles.table.td}><StatusBadge status={log.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ ...commonStyles.dashboardCard, textAlign: 'center', padding: '60px' }}>
              <Clock size={48} color={theme.colors.textMuted} style={{ marginBottom: '16px' }} />
              <h3>No progress data available</h3>
              <p style={{ color: theme.colors.textMuted }}>Attendance and task logs will appear once the student starts their internship.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={styles.sectionCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>Task & Project History</h3>
          {progress ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.table.th}>Task Description</th>
                    <th style={styles.table.th}>Due Date</th>
                    <th style={styles.table.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.taskLogs.map((task, i) => (
                    <tr key={i}>
                      <td style={styles.table.td}>{task.task}</td>
                      <td style={styles.table.td}>{task.dueDate}</td>
                      <td style={styles.table.td}><StatusBadge status={task.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textMuted }}>
              No tasks logged for this student yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
