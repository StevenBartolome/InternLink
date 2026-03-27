import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart2, TrendingUp, Users, 
  CheckCircle, PieChart, Download,
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockReportsData } from '../../data/coordinatorMockData';

const ReportsDashboardPage = () => {
  const { showToast } = useOutletContext() || {};
  const { summary, placementRate, gradeDistribution, topEmployers } = mockReportsData;

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
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
    },
    statCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
    },
    employerList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    employerItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '12px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>System Reports & Analytics</h1>
        <button 
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
          onClick={() => showToast && showToast('Generating full system report...', 'success')}
        >
          <Download size={18} />
          Export All Data
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.primary }}>
            <Users size={24} />
            <TrendingUp size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>Total Enrolled</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.totalEnrolled}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.success }}>
            <CheckCircle size={24} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>+5%</span>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>Placement Rate</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{placementRate.overall}%</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.warning }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>Average Grade</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.averageGrade}</div>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={commonStyles.dashboardCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Placement breakdown by Course</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {placementRate.breakdown.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{item.course}</span>
                  <span style={{ color: theme.colors.textMuted }}>{item.placed} / {item.total} Students</span>
                </div>
                <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.rate}%`, backgroundColor: theme.colors.primary, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={commonStyles.dashboardCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Top Performing Employers</h3>
          <div style={styles.employerList}>
            {topEmployers.map((emp, idx) => (
              <div key={idx} style={styles.employerItem}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.colors.textMain }}>{emp.company}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{emp.interns} Interns Hosted</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.colors.success }}>{emp.avgEvaluation}%</div>
                  <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted }}>Avg. Eval</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
