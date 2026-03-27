import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, CheckSquare, Clock, Plus, ArrowRight } from 'lucide-react';
import { internshipListings, applicants, activeInterns } from '../../services/mocks/employerMockData';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const DashboardPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);

  // Stats
  const totalListings = internshipListings.length;
  const totalApplicants = applicants.length;
  const activeInternCount = activeInterns.length;
  const pendingApps = applicants.filter(a => a.status === 'Pending').length;

  const recentApplicants = applicants.slice(0, 5);
  const topInterns = activeInterns.slice(0, 3);

  const styles = {
    container: {
      padding: '0 24px 24px 24px', // Removed top padding
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      h1: {
        fontSize: '24px',
        fontWeight: 700,
        color: theme.colors.textMain,
        margin: '0 0 4px 0',
      },
      subtitle: {
        color: theme.colors.textMuted,
        fontSize: '14px',
        margin: 0,
      }
    },
    headerActions: {},
    btnPrimary: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      backgroundColor: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      color: theme.colors.white,
      padding: '10px 16px',
      borderRadius: '8px',
      fontWeight: '600',
    }),
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
    },
    statCard: {
      backgroundColor: theme.colors.white,
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      border: `1px solid ${theme.colors.border}`,
    },
    statIconBg: (color) => {
      const colors = {
        green: { bg: '#dcfce7', text: '#16a34a' },
        blue: { bg: '#dbeafe', text: '#2563eb' },
        purple: { bg: '#fae8ff', text: '#a855f7' },
        orange: { bg: '#ffedd5', text: '#ea580c' }
      };
      const c = colors[color] || colors.blue;
      return {
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.bg,
        color: c.text,
      };
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    statLabel: {
      fontSize: '14px',
      color: theme.colors.textMuted,
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '8fr 3fr',
      gap: '24px',
      alignItems: 'start',
    },
    gridCard: {
      backgroundColor: theme.colors.white,
      borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      padding: '20px',
      border: `1px solid ${theme.colors.border}`,
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #f3f4f6',
      h3: {
        fontSize: '16px',
        fontWeight: 600,
        color: theme.colors.textMain,
        margin: 0,
      }
    },
    btnLink: (isHovered) => ({
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      opacity: isHovered ? 0.8 : 1,
    }),
    tableResponsive: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      ...commonStyles.dashboardTable,
      th: {
        ...commonStyles.dashboardTableTh,
        fontSize: '12px',
        color: theme.colors.textMuted,
        backgroundColor: '#f9fafb',
      },
      td: {
        ...commonStyles.dashboardTableTd,
        fontSize: '14px',
      }
    },
    internList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    internItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
    },
    internInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    hoursText: {
      fontSize: '12px',
      fontWeight: 600,
      color: theme.colors.textMuted,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.header.h1}>Welcome Back, Accenture</h1>
          <p style={styles.header.subtitle}>Here is what is happening with your internships today.</p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.btnPrimary(hoveredBtn === 'post')} 
            onMouseEnter={() => setHoveredBtn('post')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/employer/post')}
          >
            <Plus size={18} /> Post New Internship
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBg('green')}>
            <Briefcase size={24} />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{totalListings}</span>
            <span style={styles.statLabel}>Total Listings</span>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIconBg('blue')}>
            <Users size={24} />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{totalApplicants}</span>
            <span style={styles.statLabel}>Total Applicants</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBg('purple')}>
            <CheckSquare size={24} />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{activeInternCount}</span>
            <span style={styles.statLabel}>Active Interns</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBg('orange')}>
            <Clock size={24} />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{pendingApps}</span>
            <span style={styles.statLabel}>Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.dashboardGrid}>
        {/* Recent Applications */}
        <div style={styles.gridCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Recent Applications</h3>
            <button 
              style={styles.btnLink(hoveredBtn === 'viewAllApps')} 
              onMouseEnter={() => setHoveredBtn('viewAllApps')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => navigate('/employer/applicants')}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.table.th}>Student Name</th>
                  <th style={styles.table.th}>Position</th>
                  <th style={styles.table.th}>Date Applied</th>
                  <th style={styles.table.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.map(app => (
                  <tr key={app.id}>
                    <td style={styles.table.td}>
                      <span style={{ fontWeight: 600 }}>{app.studentName}</span>
                      <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>{app.course}</div>
                    </td>
                    <td style={styles.table.td}>{app.position}</td>
                    <td style={styles.table.td}>{app.dateApplied}</td>
                    <td style={styles.table.td}><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Internships */}
        <div style={styles.gridCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Active Internships</h3>
            <button 
              style={styles.btnLink(hoveredBtn === 'trackProgress')} 
              onMouseEnter={() => setHoveredBtn('trackProgress')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => navigate('/employer/progress')}
            >
              Track Progress <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.internList}>
            {topInterns.map(intern => {
              const percentage = (intern.hoursCompleted / intern.totalHours) * 100;
              return (
                <div key={intern.id} style={styles.internItem}>
                  <div style={styles.internInfo}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{intern.studentName}</span>
                      <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>{intern.position}</div>
                    </div>
                    <span style={styles.hoursText}>{intern.hoursCompleted} / {intern.totalHours} hrs</span>
                  </div>
                  <ProgressBar percentage={percentage} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
