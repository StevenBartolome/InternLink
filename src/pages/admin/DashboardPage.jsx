import React, { useState, useCallback } from 'react';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Briefcase, AlertTriangle, ArrowRight, UserPlus, FileText } from 'lucide-react';
import { dashboardStats, auditLogs, systemReports } from '../../services/mocks/adminMockData';
import StatCard from '../../components/common/StatCard';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { supabase } from '../../services/supabaseClient';

const DashboardPage = () => {
  const { user } = useAuth();

  const getCourseGradient = (courseCode) => {
    const codes = courseCode.toUpperCase();
    if (codes.includes('IT')) return 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)';
    if (codes.includes('CS')) return 'linear-gradient(90deg, #10B981 0%, #34D399 100%)';
    if (codes.includes('IS')) return 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)';
    if (codes.includes('PE') || codes.includes('ECE')) return 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)';
    return 'linear-gradient(90deg, #64748B 0%, #94A3B8 100%)';
  };

  const getCourseBg = (courseCode) => {
    const codes = courseCode.toUpperCase();
    if (codes.includes('IT')) return '#EFF6FF';
    if (codes.includes('CS')) return '#ECFDF5';
    if (codes.includes('IS')) return '#F5F3FF';
    if (codes.includes('PE') || codes.includes('ECE')) return '#FFFBEB';
    return '#F8FAFC';
  };

  const getCourseTextColor = (courseCode) => {
    const codes = courseCode.toUpperCase();
    if (codes.includes('IT')) return '#1E40AF';
    if (codes.includes('CS')) return '#065F46';
    if (codes.includes('IS')) return '#5B21B6';
    if (codes.includes('PE') || codes.includes('ECE')) return '#92400E';
    return '#475569';
  };

  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsInPreInternship: 0,
    studentsInDuringInternship: 0,
    studentsInPostInternship: 0,
    studentsCompleted: 0
  });
  const [courseStats, setCourseStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [hoveredAction, setHoveredAction] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Student Counts by Stage
      const { data: internshipData, error: iError } = await supabase
        .from('student_internships')
        .select('current_stage');

      if (iError) throw iError;

      const counts = {
        totalStudents: internshipData.length,
        studentsInPreInternship: internshipData.filter(i => i.current_stage === 'PRE_INTERNSHIP').length,
        studentsInDuringInternship: internshipData.filter(i => i.current_stage === 'DURING_INTERNSHIP').length,
        studentsInPostInternship: internshipData.filter(i => i.current_stage === 'POST_INTERNSHIP').length,
        studentsCompleted: internshipData.filter(i => i.current_stage === 'COMPLETED').length,
      };

      setStats(counts);

      // 2. Fetch Course Breakdown
      const { data: profileData, error: pError } = await supabase
        .from('student_profiles')
        .select('programs ( code )');

      if (pError) throw pError;

      const breakdown = profileData.reduce((acc, curr) => {
        const course = curr.programs?.code || 'Unassigned';
        acc[course] = (acc[course] || 0) + 1;
        return acc;
      }, {});

      setCourseStats(Object.entries(breakdown).map(([course, enrolled]) => ({ course, enrolled })));

      // 3. Fetch Recent Activity (Audit Logs)
      const { data: logsData, error: lError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (lError) throw lError;
      setRecentActivity(logsData || []);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      showToast('Failed to load real-time stats', 'error');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useRealtimeSubscription(
    ['student_internships', 'student_profiles', 'audit_logs'],
    fetchDashboardData
  );

  const showToast = (message, type = 'info') => setToast({ message, type });

  const handleVerifyAccounts = () => navigate('/admin/users');
  const handleViewReports = () => navigate('/admin/reports');

  const handleViewAllActivity = () => navigate('/admin/audit');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      padding: '8px',
    },
    welcomeBanner: {
      background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
      color: theme.colors.white,
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 10px 30px rgba(30, 64, 175, 0.12)',
      position: 'relative',
      overflow: 'hidden',
      h1: {
        fontSize: '2rem',
        fontWeight: 800,
        margin: '0 0 0.5rem 0',
        letterSpacing: '-0.025em',
      },
      p: {
        margin: '0 0 0.25rem 0',
        fontSize: '1rem',
        opacity: 0.95,
      },
      welcomeSubtext: {
        opacity: 0.8,
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        fontWeight: 500,
      }
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
    },
    quickActions: {
      backgroundColor: theme.colors.bgPrimary,
      padding: '1.75rem',
      borderRadius: '16px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
      h3: {
        fontSize: '1.05rem',
        fontWeight: 700,
        color: theme.colors.textMain,
        margin: '0 0 1.25rem 0',
      }
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    actionBtn: (id, type) => {
      const isPrimary = type === 'primary';
      const isHovered = hoveredAction === id;

      return {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.7rem 1.4rem',
        borderRadius: '10px',
        border: isPrimary ? 'none' : `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
        backgroundColor: isPrimary
          ? (isHovered ? theme.colors.primaryHover : theme.colors.primary)
          : (isHovered ? theme.colors.bgSecondary : theme.colors.bgPrimary),
        color: isPrimary ? theme.colors.white : (isHovered ? theme.colors.primary : theme.colors.textMain),
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: 'pointer',
        boxShadow: isPrimary ? '0 4px 12px rgba(30, 64, 175, 0.15)' : 'none',
        transition: theme.transitions.default,
      };
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      gap: '2rem',
    },
    dashboardCard: {
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: '20px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    cardHeader: {
      padding: '1.5rem 1.75rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: 'rgba(248, 250, 252, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      h3: {
        fontSize: '1.1rem',
        fontWeight: 750,
        color: theme.colors.textMain,
        margin: 0,
      }
    },
    viewAllBtn: {
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontSize: '0.875rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      cursor: 'pointer',
    },
    cardContent: {
      padding: '1.75rem',
      flex: 1,
    },
    distributionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    activityIconBadge: (type) => {
      const colors = {
        create: { bg: '#EFF6FF', text: '#1E40AF' },
        update: { bg: '#FEF3C7', text: '#92400E' },
        system: { bg: '#FDE8E8', text: '#9B1C1C' },
        login: { bg: '#F3F4F6', text: '#374151' },
      };
      const c = colors[type.toLowerCase()] || colors.login;
      return {
        padding: '0.6rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.bg,
        color: c.text,
      };
    },
    activityDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    activityText: {
      fontSize: '0.875rem',
      color: theme.colors.textMain,
      margin: 0,
      lineHeight: '1.4',
    },
    activityTime: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
      fontWeight: 500,
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.welcomeBanner}
      >
        <div style={{ zIndex: 2, position: 'relative' }}>
          <h1 style={styles.welcomeBanner.h1}>Welcome back, {user?.first_name || 'Admin'}!</h1>
          <p style={styles.welcomeBanner.p}>System Status: <span style={{ backgroundColor: '#22c55e', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, marginLeft: '6px' }}>OPERATIONAL</span></p>
          <p style={styles.welcomeBanner.welcomeSubtext}>Central oversight for all OJT programs and 3-stage workflows.</p>
        </div>
        {/* Subtle decorative circles for a premium tech vibe */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', top: '-100px', right: '-50px', zIndex: 1 }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', bottom: '-80px', right: '150px', zIndex: 1 }} />
      </motion.div>

      {/* Grid Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={styles.statsGrid}
      >
        <StatCard
          title="Total Students"
          value={loading ? '...' : stats.totalStudents}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Pre-Internship"
          value={loading ? '...' : stats.studentsInPreInternship}
          icon={FileText}
          color="warning"
        />
        <StatCard
          title="During Internship"
          value={loading ? '...' : stats.studentsInDuringInternship}
          icon={Briefcase}
          color="success"
        />
        <StatCard
          title="Post-Internship"
          value={loading ? '...' : stats.studentsInPostInternship + stats.studentsCompleted}
          icon={CheckCircle}
          color="info"
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={styles.quickActions}
      >
        <h3 style={styles.quickActions.h3}>Quick Actions</h3>
        <div style={styles.actionButtons}>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={styles.actionBtn('verify', 'secondary')}
            onMouseEnter={() => setHoveredAction('verify')}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={handleVerifyAccounts}
          >
            <CheckCircle size={18} /> Verify Accounts
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={styles.actionBtn('reports', 'secondary')}
            onMouseEnter={() => setHoveredAction('reports')}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={handleViewReports}
          >
            <FileText size={18} /> View Reports
          </motion.button>

        </div>
      </motion.div>

      {/* Dashboard Sub-Grid */}
      <div style={styles.dashboardGrid}>
        {/* Role Distribution */}
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.05)' }}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={styles.dashboardCard}
        >
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Course Breakdown</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.distributionList}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', border: `3px solid ${theme.colors.primary}20`, borderTop: `3px solid ${theme.colors.primary}`, borderRadius: '50%', animation: 'spin-loader 0.8s linear infinite' }} />
                  <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Loading course stats...</span>
                </div>
              ) : courseStats.length > 0 ? (
                courseStats.map(course => {
                  const percentage = stats.totalStudents > 0 ? Math.round((course.enrolled / stats.totalStudents) * 100) : 0;
                  return (
                    <div key={course.course} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: getCourseBg(course.course),
                          color: getCourseTextColor(course.course),
                          border: `1px solid ${getCourseTextColor(course.course)}15`
                        }}>
                          {course.course}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.colors.textMain }}>{course.enrolled}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 550, color: theme.colors.textMuted }}>({percentage}%)</span>
                        </div>
                      </div>
                      <div style={{ height: '8px', width: '100%', backgroundColor: theme.colors.bgSecondary, borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: getCourseGradient(course.course),
                            borderRadius: '6px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: theme.colors.textMuted, fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No student data found.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.05)' }}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={styles.dashboardCard}
        >
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Recent Activity</h3>
            <button style={styles.viewAllBtn} onClick={handleViewAllActivity}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.activityList}>
              {recentActivity.map((log) => (
                <motion.div
                  whileHover={{ x: 6, backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                  key={log.id}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={styles.activityIconBadge(log.type)}>
                    {log.type === 'Create' && <UserPlus size={16} />}
                    {log.type === 'Update' && <FileText size={16} />}
                    {log.type === 'System' && <AlertTriangle size={16} />}
                    {(log.type === 'Login' || log.type === 'Delete') && <Users size={16} />}
                  </div>
                  <div style={styles.activityDetails}>
                    <p style={styles.activityText}>
                      <strong>{log.user_name || 'System'}</strong> <span style={{ color: theme.colors.textMuted, fontSize: '0.78rem', fontWeight: 600 }}>({log.user_role ? log.user_role.toUpperCase() : 'SYSTEM'})</span> {log.action?.toLowerCase() || ''}
                    </p>
                    <span style={styles.activityTime}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
