import React from 'react';
import { 
  BarChart3, TrendingUp, PieChart, 
  Download, Calendar, Users, 
  CheckCircle, Briefcase, FileText,
  ArrowUpRight, ArrowDownRight, Printer, Info
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { reportsData } from '../../data/adminMockData';

const SystemReportsPage = () => {
  const { academicTerm, totalEnrolled, totalPlaced, totalCompleted, placementRate, courseBreakdown, gradeDistribution } = reportsData;

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
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
    },
    statCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    chartGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Reports</h1>
          <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>{academicTerm} Analysis</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}><Printer size={18} /> Print</button>
          <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}><Download size={18} /> Export PDF</button>
        </div>
      </header>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Placement</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{placementRate}%</span>
            <span style={{ color: theme.colors.success, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={12} /> +2.4%
            </span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Completed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalCompleted} / {totalEnrolled}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg. Final Grade</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{reportsData.avgFinalGrade}</div>
        </div>
      </div>

      <div style={styles.chartGrid}>
        <div style={commonStyles.dashboardCard}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Placement Matrix</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {courseBreakdown.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{c.course}</span>
                  <span style={{ color: theme.colors.textMuted }}>{c.placed}/{c.enrolled}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c.placed/c.enrolled)*100}%`, backgroundColor: theme.colors.primary }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={commonStyles.dashboardCard}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Evaluation Trend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(gradeDistribution).map(([key, data]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: key === 'excellent' ? theme.colors.success : (key === 'satisfactory' ? theme.colors.primary : theme.colors.warning) }}></div>
                <div style={{ flex: 1, fontSize: '0.875rem', textTransform: 'capitalize' }}>{key}</div>
                <div style={{ fontWeight: 700 }}>{data.pct}%</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: theme.colors.bgAccent, borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Info size={20} color={theme.colors.primary} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textMuted }}>Automated reporting generated by the Academic Affairs system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReportsPage;
