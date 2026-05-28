import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart2, TrendingUp, Users, CheckCircle, Download } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import Toast from '../../components/common/Toast';
import PageLoader from '../../components/common/PageLoader';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const STATUS_MAP = {
  'PRE_INTERNSHIP': 'Pre-Internship',
  'DURING_INTERNSHIP': 'Placed',
  'POST_INTERNSHIP': 'Post-Internship',
  'COMPLETED': 'Completed'
};

const ReportsDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useOutletContext() || {};
  const [toast, setToast] = useState(null);
  
  // Data State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('AY 2025–2026');
  const [semester, setSemester] = useState('2nd Semester');

  const notify = useCallback((msg, type) => {
    if (showToast) showToast(msg, type);
    else setToast({ message: msg, type });
  }, [showToast]);

  const fetchReportsData = useCallback(async () => {
    if (!user?.program_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('users')
        .select(`
          id, first_name, last_name,
          student_profiles!inner (
            student_id, year_level, program_id, section_id, academic_year, semester,
            programs ( id, code, name, required_hours )
          ),
          student_internships!student_id (
            current_stage, rendered_hours, supervisor_name, is_deployed, final_grade,
            companies ( name )
          )
        `)
        .eq('role', 'student')
        .eq('student_profiles.program_id', user.program_id);

      const profSectionIds = user?.professor_sections?.map(ps => ps.section_id) || [];
      if (profSectionIds.length > 0) {
        query = query.in('student_profiles.section_id', profSectionIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const firstProfile = (Array.isArray(data[0].student_profiles) ? data[0].student_profiles[0] : data[0].student_profiles) || {};
        if (firstProfile.academic_year) setAcademicYear(firstProfile.academic_year);
        if (firstProfile.semester) setSemester(firstProfile.semester);
      }

      const transformed = data.map(s => {
        const profile = (Array.isArray(s.student_profiles) ? s.student_profiles[0] : s.student_profiles) || {};
        const internship = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
        const company = internship.companies || {};

        return {
          id: s.id,
          studentId: profile.student_id || 'Not Set',
          name: `${s.first_name} ${s.last_name}`,
          course: profile.programs?.code || 'Not Assigned',
          yearLevel: profile.year_level || 'Not Set',
          status: STATUS_MAP[internship.current_stage] || 'Pre-Internship',
          company: company.name || 'Not Applied',
          supervisor: internship.supervisor_name || 'Not Placed',
          isDeployed: internship.is_deployed || false,
          hoursRendered: internship.rendered_hours || 0,
          hoursRequired: profile.programs?.required_hours || 486,
          grade: internship.final_grade,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.first_name + ' ' + s.last_name)}&background=random`
        };
      });

      setStudents(transformed);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      notify('Failed to load reports and analytics.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.program_id, user?.professor_sections, notify]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (students.length === 0) {
      notify('No data to export', 'info');
      return;
    }
    
    try {
      const headers = ['Student ID', 'Name', 'Course', 'Year Level', 'Company', 'Hours Rendered', 'Hours Required', 'Final Grade', 'Status'];
      const rows = students.map(student => [
        student.studentId,
        student.name,
        student.course,
        student.yearLevel,
        student.company,
        student.hoursRendered,
        student.hoursRequired,
        student.grade !== null && student.grade !== undefined ? `${student.grade}%` : 'Pending',
        student.status
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `OJT_Report_${user?.course_code || 'Course'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notify('Report successfully exported to CSV!', 'success');
    } catch (err) {
      console.error('CSV Export Error:', err);
      notify('Failed to export report', 'error');
    }
  };

  // Computations
  const totalStudents = students.length;
  const deployed = students.filter(s => s.isDeployed).length;
  const completed = students.filter(s => s.status === 'Completed').length;
  
  // Dynamic At-Risk definition: Deployed but has logged 0 hours
  const atRisk = students.filter(s => s.isDeployed && s.hoursRendered === 0).length;
  
  const graded = students.filter(s => s.grade !== null && s.grade !== undefined).map(s => parseFloat(s.grade));
  const avgGrade = graded.length > 0 ? (graded.reduce((a,b) => a + b, 0) / graded.length).toFixed(2) : 'No Grades';

  const stageBreakdown = [
    { label: 'Pre-Internship', count: students.filter(s => s.status === 'Pre-Internship').length, color: '#3b82f6' },
    { label: 'During Internship', count: students.filter(s => s.status === 'Placed').length, color: '#16a34a' },
    { label: 'Post-Internship', count: students.filter(s => s.status === 'Post-Internship').length, color: '#d97706' },
    { label: 'Completed', count: completed, color: '#7c3aed' },
  ];

  if (loading) {
    return <PageLoader message="Loading reports and analytics..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Course Reports & Analytics</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>
            {user?.course_code || 'OJT'} Course — {academicYear}, {semester}
          </p>
        </div>
        <button 
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }} 
          onClick={handleExportCSV}
        >
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
      <div style={{ ...commonStyles.dashboardCard, padding: '0', overflow: 'hidden', border: `1px solid ${theme.colors.border}` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: theme.colors.textMain }}>Student Analytics Roster</h3>
        </div>
        <div style={{ ...commonStyles.dashboardTableContainer, margin: 0, boxShadow: 'none', border: 'none', borderRadius: '0' }}>
          {students.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.textMuted }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>No students found under your program sections.</p>
            </div>
          ) : (
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
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ ...commonStyles.dashboardTableTd }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.bgAccent || '#eff6ff',
                          color: theme.colors.primary || '#2563eb',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem'
                        }}>
                          {s.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 600, color: theme.colors.textMain, fontSize: '0.875rem' }}>{s.name}</div>
                      </div>
                    </td>
                    <td style={{ ...commonStyles.dashboardTableTd }}>
                      <span style={{ 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        backgroundColor: s.status === 'Completed' ? '#dcfce7' : (s.status === 'Placed' ? '#dbeafe' : '#fef9c3'), 
                        color: s.status === 'Completed' ? '#15803d' : (s.status === 'Placed' ? '#1d4ed8' : '#92400e') 
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ ...commonStyles.dashboardTableTd, fontSize: '0.85rem', color: theme.colors.textSecondary }}>{s.company}</td>
                    <td style={{ ...commonStyles.dashboardTableTd, fontWeight: 700 }}>{s.hoursRendered} / {s.hoursRequired}</td>
                    <td style={{ ...commonStyles.dashboardTableTd, fontWeight: 700, color: s.grade ? '#16a34a' : theme.colors.textMuted }}>
                      {s.grade !== null && s.grade !== undefined ? `${s.grade}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
