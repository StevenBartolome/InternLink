// src/pages/supervisor/MyInternsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, GraduationCap, ArrowRight } from 'lucide-react';
import { internsData } from '../../services/mocks/supervisorMockData';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const MyInternsPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = {
    container: {
      padding: isMobile ? '1rem' : '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      ...commonStyles.heading,
      fontSize: isMobile ? '1.5rem' : '1.875rem',
      margin: 0,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '1rem',
      marginTop: '0.25rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
    },
    card: (isHovered) => ({
      ...commonStyles.dashboardCard,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'translateY(-4px)' : 'none',
      boxShadow: isHovered ? theme.shadows.lg : theme.shadows.sm,
      border: isHovered ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
      padding: 0,
    }),
    cardHeader: {
      padding: '1.5rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    avatar: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${theme.colors.white}`,
      boxShadow: theme.shadows.sm,
    },
    headerInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    internName: {
      fontSize: '1.125rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      margin: 0,
    },
    internCourse: {
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
    },
    cardBody: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: theme.colors.textMain,
      fontSize: '0.925rem',
    },
    infoIcon: {
      color: theme.colors.primary,
    },
    progressSection: {
      marginTop: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    sectionLabel: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.colors.textMuted,
    },
    hoursMetrics: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '0.5rem',
    },
    metric: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    metricVal: {
      fontSize: '1rem',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    metricLabel: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    cardFooter: {
      padding: '1.25rem 1.5rem',
      backgroundColor: theme.colors.bgSecondary,
      borderTop: `1px solid ${theme.colors.border}`,
      display: 'flex',
      justifyContent: 'center',
    },
    viewDetailsBtn: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      backgroundColor: 'transparent',
      border: `1px solid ${theme.colors.primary}`,
      color: theme.colors.primary,
      fontWeight: 600,
      transition: 'all 0.2s ease',
      ...(isHovered && {
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
      })
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Assigned Interns</h2>
          <p style={styles.subtitle}>Monitor progress and manage daily logs</p>
        </div>
      </div>

      <div style={styles.grid}>
        {internsData.map((intern) => (
          <div 
            key={intern.id} 
            style={styles.card(hoveredCard === intern.id)}
            onMouseEnter={() => setHoveredCard(intern.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
          >
            <div style={styles.cardHeader}>
              <img src={intern.photo} alt={intern.name} style={styles.avatar} />
              <div style={styles.headerInfo}>
                <StatusBadge status={intern.todayStatus} />
                <h3 style={styles.internName}>{intern.name}</h3>
                <span style={styles.internCourse}>{intern.course}</span>
              </div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.infoItem}>
                <GraduationCap size={18} style={styles.infoIcon} />
                <span>{intern.school}</span>
              </div>
              <div style={styles.infoItem}>
                <Phone size={18} style={styles.infoIcon} />
                <span>{intern.contact}</span>
              </div>
              
              <div style={styles.progressSection}>
                <div style={styles.sectionLabel}>Rendered Hours Progress</div>
                <ProgressBar rendered={intern.renderedHours} required={intern.requiredHours} />
                
                <div style={styles.hoursMetrics}>
                  <div style={styles.metric}>
                    <span style={styles.metricVal}>{intern.renderedHours}</span>
                    <span style={styles.metricLabel}>Rendered</span>
                  </div>
                  <div style={styles.metric}>
                    <span style={styles.metricVal}>{intern.requiredHours - intern.renderedHours}</span>
                    <span style={styles.metricLabel}>Remaining</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button style={styles.viewDetailsBtn(hoveredCard === intern.id)}>
                View Full Profile <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInternsPage;
