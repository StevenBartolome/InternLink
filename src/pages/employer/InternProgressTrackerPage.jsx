// src/pages/employer/InternProgressTrackerPage.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, CheckCircle2, Circle, User, ListTodo, History } from 'lucide-react';
import { activeInterns } from '../../services/mocks/employerMockData';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternProgressTrackerPage = () => {
  const [expandedInternId, setExpandedInternId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmall = useMediaQuery('(max-width: 480px)');

  const toggleExpand = (id) => {
    setExpandedInternId(expandedInternId === id ? null : id);
  };

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
    title: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '14px',
      margin: 0,
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    card: (isExpanded) => ({
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: isExpanded ? theme.shadows.md : theme.shadows.sm,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isExpanded ? 'translateY(-2px)' : 'none',
    }),
    summary: (isHovered) => ({
      padding: isMobile ? '20px' : '24px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      flexWrap: 'wrap',
      gap: '24px',
      backgroundColor: isHovered ? '#f8fafc' : 'transparent',
      transition: 'background-color 0.2s',
    }),
    internInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: isMobile ? '1 1 100%' : '0 0 250px',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '16px',
      backgroundColor: '#eff6ff',
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: '18px',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
    },
    statsGroup: {
      display: 'flex',
      gap: '24px',
      flex: isMobile ? '1 1 100%' : '1',
      alignItems: 'center',
      justifyContent: isSmall ? 'flex-start' : 'center',
      flexWrap: 'wrap',
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: 600,
      color: theme.colors.textMuted,
    },
    progressWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: isMobile ? '1 1 100%' : '0 0 200px',
    },
    percentText: {
      fontSize: '14px',
      fontWeight: 800,
      color: theme.colors.textMain,
      minWidth: '40px',
    },
    details: {
      padding: isMobile ? '24px' : '32px',
      borderTop: `1px solid ${theme.colors.border}`,
      backgroundColor: '#f8fafc',
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
      gap: '2.5rem',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: theme.colors.textMuted,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    taskList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    taskItem: (isCompleted) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      fontSize: '14px',
      color: isCompleted ? theme.colors.textMuted : theme.colors.textMain,
      fontWeight: 600,
      padding: '12px 16px',
      backgroundColor: theme.colors.white,
      borderRadius: '14px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    }),
    logList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    logCard: {
      backgroundColor: theme.colors.white,
      padding: '16px',
      borderRadius: '16px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    },
    logHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    hoursBadge: {
      backgroundColor: '#f1f5f9',
      color: theme.colors.textMain,
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Intern Progress Tracker</h1>
        <p style={styles.subtitle}>Real-time monitoring of intern contributions and curriculum milestones.</p>
      </div>

      <div style={styles.list}>
        {activeInterns.map(intern => {
          const isExpanded = expandedInternId === intern.id;
          const isHovered = hoveredCard === intern.id;
          const percentage = (intern.hoursCompleted / intern.totalHours) * 100;

          return (
            <div 
              key={intern.id} 
              style={styles.card(isExpanded)}
              onMouseEnter={() => setHoveredCard(intern.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.summary(isHovered)} onClick={() => toggleExpand(intern.id)}>
                <div style={styles.internInfo}>
                  <div style={styles.avatar}>
                    {intern.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{intern.studentName}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.colors.primary, fontWeight: 700 }}>{intern.position}</p>
                  </div>
                </div>

                <div style={styles.statsGroup}>
                  <div style={styles.statItem}>
                    <Calendar size={16} />
                    <span>{intern.startDate} - {intern.endDate}</span>
                  </div>
                  <div style={styles.statItem}>
                    <Clock size={16} />
                    <span>{intern.hoursCompleted} / {intern.totalHours} hrs</span>
                  </div>
                </div>

                <div style={styles.progressWrapper}>
                  <div style={{ flex: 1 }}>
                    <ProgressBar percentage={percentage} />
                  </div>
                  <span style={styles.percentText}>{Math.round(percentage)}%</span>
                </div>

                <button style={{ ...commonStyles.buttonSecondary, padding: '8px', border: 'none', background: 'none' }}>
                  {isExpanded ? <ChevronUp size={22} color={theme.colors.textMuted} /> : <ChevronDown size={22} color={theme.colors.textMuted} />}
                </button>
              </div>

              {isExpanded && (
                <div style={styles.details}>
                  <div style={styles.detailsGrid}>
                    {/* Tasks */}
                    <div>
                      <h5 style={styles.sectionTitle}><ListTodo size={16} /> Key Deliverables</h5>
                      <div style={styles.taskList}>
                        {intern.tasks.map(task => {
                          const isCompleted = task.status === 'Completed';
                          return (
                            <div key={task.id} style={styles.taskItem(isCompleted)}>
                              {isCompleted ? (
                                <CheckCircle2 size={18} color="#16a34a" />
                              ) : (
                                <Circle size={18} color={theme.colors.border} />
                              )}
                              <span style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                {task.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weekly Logs */}
                    <div>
                      <h5 style={styles.sectionTitle}><History size={16} /> Performance Logs</h5>
                      <div style={styles.logList}>
                        {intern.weeklyLogs.map((log, index) => (
                          <div key={index} style={styles.logCard}>
                            <div style={styles.logHeader}>
                              <span style={{ fontWeight: 800, fontSize: '14px' }}>Week {log.week}</span>
                              <span style={styles.hoursBadge}>{log.hours} hours logged</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.6 }}>
                              {log.log}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InternProgressTrackerPage;
