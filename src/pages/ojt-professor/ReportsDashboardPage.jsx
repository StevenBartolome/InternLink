import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart2, TrendingUp, Users, CheckCircle, Download } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockStudents } from '../../services/mocks/ojtProfessorMockData';
import { useState } from 'react';
import Toast from '../../components/common/Toast';

const ReportsDashboardPage = () => {
  const { showToast } = useOutletContext() || {};
  const [toast, setToast] = useState(null);
  const notify = (msg, type) => { if (showToast) showToast(msg, type); else setToast({ message: msg, type }); };

  const totalStudents = mockStudents.length;
  const deployed = mockStudents.filter(s => s.isDeployed).length;
  const completed = mockStudents.filter(s => s.currentStage === 'COMPLETED').length;
  const atRisk = mockStudents.filter(s => s.isAtRisk).length;
  const graded = mockStudents.filter(s => s.grade).map(s => parseFloat(s.grade));
  const avgGrade = graded.length > 0 ? (graded.reduce((a,b) => a + b, 0) / graded.length).toFixed(2) : 'N/A';

  const stageBreakdown = [
    { label: 'Pre-Internship', count: mockStudents.filter(s => s.currentStage === 'PRE_INTERNSHIP').length, color: '#3b82f6' },
    { label: 'During Internship', count: mockStudents.filter(s => s.currentStage === 'DURING_INTERNSHIP').length, color: '#16a34a' },
    { label: 'Post-Internship', count: mockStudents.filter(s => s.currentStage === 'POST_INTERNSHIP').length, color: '#d97706' },
    { label: 'Completed', count: completed, color: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Course Reports & Analytics</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>BSIT Course — AY 2025–2026, 2nd Semester</p>
        </div>
        <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }} onClick={() => notify('Generating report... Download starting.', 'success')}>
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Total Students', value: totalStudents, icon: <Users size={22} />, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Deployed', value: deployed, icon: <CheckCircle size={22} />, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Completed', value: completed, icon: <BarChart2 size={22} />, color: '#7c3aed', bg: '#f3e8ff' },
          { label: 'At-Risk', value: atRisk, icon: <TrendingUp size={22} />, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Avg Final Grade', value: avgGrade, icon: <BarChart2 size={22} />, color: '#d97706', bg: '#fef9c3' },
        ].map(s => (
          <div key={s.label} style={{ ...commonStyles.dashboardCard, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: theme.colors.textMuted, fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stage breakdown */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Student Stage Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stageBreakdown.map(s => (
            <div key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: theme.colors.textMain }}>{s.label}</span>
                <span style={{ color: theme.colors.textMuted }}>{s.count} / {totalStudents}</span>
              </div>
              <div style={{ height: '10px', backgroundColor: theme.colors.bgSecondary, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalStudents > 0 ? (s.count / totalStudents) * 100 : 0}%`, backgroundColor: s.color, borderRadius: '6px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student list summary */}
      <div style={{ ...commonStyles.dashboardTableContainer }}>
        <table style={{ ...commonStyles.dashboardTable }}>
          <thead>
            <tr>
              <th style={{ ...commonStyles.dashboardTableTh }}>Student</th>
              <th style={{ ...commonStyles.dashboardTableTh }}>Stage</th>
              <th style={{ ...commonStyles.dashboardTableTh }}>Company</th>
              <th style={{ ...commonStyles.dashboardTableTh }}>Hours</th>
              <th style={{ ...commonStyles.dashboardTableTh }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map(s => (
              <tr key={s.id}>
                <td style={{ ...commonStyles.dashboardTableTd }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={s.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div style={{ fontWeight: 600, color: theme.colors.textMain, fontSize: '0.875rem' }}>{s.name}</div>
                  </div>
                </td>
                <td style={{ ...commonStyles.dashboardTableTd }}>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1d4ed8' }}>{s.currentStage.replace('_', ' ')}</span>
                </td>
                <td style={{ ...commonStyles.dashboardTableTd, fontSize: '0.85rem', color: theme.colors.textSecondary }}>{s.company || '—'}</td>
                <td style={{ ...commonStyles.dashboardTableTd, fontWeight: 700 }}>{s.renderedHours}/{s.requiredHours}</td>
                <td style={{ ...commonStyles.dashboardTableTd, fontWeight: 700, color: s.grade ? '#16a34a' : theme.colors.textMuted }}>{s.grade || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;


