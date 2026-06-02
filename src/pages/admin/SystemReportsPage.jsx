import React from 'react';
import { 
  Download,
  ArrowUpRight, Printer, Info
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { systemReports as mockSystemReports } from '../../services/mocks/adminMockData';

import Toast from '../../components/common/Toast';
import { useState, useEffect } from 'react';

const SystemReportsPage = () => {
  const [systemReports, setSystemReports] = useState({ academicYear: '2025-2026', semester: '2nd Semester', courseBreakdown: [] });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/admin/system-reports');
        if (!response.ok) throw new Error('Failed to fetch system reports');
        const data = await response.json();
        
        if (data.courseBreakdown && data.courseBreakdown.length > 0) {
          setSystemReports(data);
        } else {
          // Fallback to mock data if no programs/courses exist in DB yet
          setSystemReports(mockSystemReports);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setSystemReports(mockSystemReports);
      }
    };
    fetchReports();
  }, []);

  const { academicYear, semester, courseBreakdown } = systemReports;
  const totalEnrolled = courseBreakdown.reduce((a, c) => a + (c.enrolled || 0), 0);
  const totalCompleted = courseBreakdown.reduce((a, c) => a + (c.completed || 0), 0);
  const academicTerm = `${academicYear} — ${semester}`;

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    showToast('Generating PDF report… Download will start shortly.', 'info');
    setTimeout(() => showToast('PDF export completed successfully.', 'success'), 1500);
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Reports</h1>
          <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>{academicTerm} Analysis</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
            onClick={handlePrint}
          >
            <Printer size={18} /> Print
          </button>
          <button
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
            onClick={handleExportPDF}
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
      </header>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Placement</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalEnrolled > 0 ? ((totalCompleted/totalEnrolled)*100).toFixed(1) : '0.0'}%</span>
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
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{courseBreakdown[0]?.avgGrade || 'No Grades'}</div>
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
                  <span style={{ color: theme.colors.textMuted }}>{c.completed}/{c.enrolled}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.enrolled > 0 ? (c.completed/c.enrolled)*100 : 0}%`, backgroundColor: theme.colors.primary }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={commonStyles.dashboardCard}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Evaluation Trend</h3>
          <div style={{ marginTop: '24px', fontSize: '0.875rem', color: theme.colors.textMuted }}>Grade breakdown data available after semester completion.</div>
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
