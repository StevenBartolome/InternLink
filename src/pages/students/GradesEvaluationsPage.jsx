import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Award, FileText, CheckCircle, 
  MessageSquare, User, Building2,
  TrendingUp, Download, Info,
  Star, ShieldCheck
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { gradesEvaluations, progressState } from '../../services/mocks/mockData';

const GradesEvaluationsPage = () => {
  const { showToast } = useOutletContext() || {};

  const handleExport = () => {
    if (showToast) {
      showToast('Preparing OJT Report...', 'info');
      setTimeout(() => {
        showToast('OJT Report exported successfully!', 'success');
      }, 2000);
    }
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
      alignItems: 'baseline',
    },
    gradeHero: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      alignItems: 'center',
      gap: '40px',
      padding: '40px',
      background: 'linear-gradient(135deg, #FFF 0%, #EBF1FF 100%)',
    },
    scoreGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
    },
    criteriaCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Grades & Evaluations</h1>
        <button 
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
          onClick={handleExport}
        >
          <Download size={18} /> Export OJT Report
        </button>
      </header>

      <div style={styles.gradeHero}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: theme.colors.primary, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(30, 64, 175, 0.2)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{gradesEvaluations.overallGrade}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>FINAL GRADE</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.primary, marginBottom: '8px' }}>
            <ShieldCheck size={20} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Coordinator Verified</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px 0' }}>{progressState.company}</h2>
          <p style={{ margin: 0, color: theme.colors.textMuted, lineHeight: 1.6, maxWidth: '600px' }}>
            "{gradesEvaluations.coordinatorRemarks}"
          </p>
        </div>
      </div>

      <div style={styles.scoreGrid}>
        {gradesEvaluations.evaluations.map((evalItem, i) => (
          <div key={i} style={styles.criteriaCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{evalItem.criteria}</span>
              <span style={{ fontWeight: 800, color: theme.colors.primary, fontSize: '1.1rem' }}>{evalItem.score}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${evalItem.score}%`, backgroundColor: theme.colors.primary }}></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...commonStyles.dashboardCard, padding: '32px', backgroundColor: theme.colors.bgSecondary, border: `1px dashed ${theme.colors.border}` }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color={theme.colors.primary} />
          Employer Feedback Details
        </h3>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.9rem', lineHeight: 1.6 }}>
          Detailed performance metrics and qualitative feedback from your industry supervisor (Alex Mercer) are available in the detailed transcript. These evaluations are used for final credit processing.
        </p>
        <button style={{ marginTop: '20px', ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>
          Request Feedback Review
        </button>
      </div>
    </div>
  );
};

export default GradesEvaluationsPage;
