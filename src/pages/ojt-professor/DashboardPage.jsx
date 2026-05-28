import React, { useState, useEffect, useCallback } from 'react';
import { Users, FileCheck, AlertCircle, FileText, ArrowRight, Activity, BarChart2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import StatCard from '../../components/layout/ojt-professor/StatCard';
import PageLoader from '../../components/common/PageLoader';
import { supabase } from '../../services/supabaseClient';

import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthContext';

const STATUS_MAP = {
  'PRE_INTERNSHIP': 'Pre-Internship',
  'DURING_INTERNSHIP': 'Placed',
  'POST_INTERNSHIP': 'Post-Internship',
  'COMPLETED': 'Completed'
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useOutletContext() || {};
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredFeedItem, setHoveredFeedItem] = useState(null);
  const [hoveredShortcut, setHoveredShortcut] = useState(null);

  // Dynamic Data State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Total Students", value: 0, icon: Users, color: "primary" },
    { title: "Deployed", value: 0, icon: FileCheck, color: "success" },
    { title: "Pending Doc Reviews", value: 0, icon: AlertCircle, color: "warning" },
    { title: "Evaluations Due", value: 0, icon: FileText, color: "info" }
  ]);
  const [activities, setActivities] = useState([]);

  // Helper function to format timestamps
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 0) return 'just now';
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user?.program_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch Students
      let studentQuery = supabase
        .from('users')
        .select(`
          id, first_name, last_name,
          student_profiles!inner (
            student_id, year_level, program_id, section_id
          ),
          student_internships!student_id (
            id, current_stage, rendered_hours, supervisor_name, is_deployed
          )
        `)
        .eq('role', 'student')
        .eq('student_profiles.program_id', user.program_id);

      const profSectionIds = user?.professor_sections?.map(ps => ps.section_id) || [];
      if (profSectionIds.length > 0) {
        studentQuery = studentQuery.in('student_profiles.section_id', profSectionIds);
      }

      const { data: studentsData, error: studentError } = await studentQuery;
      if (studentError) throw studentError;

      const studentInternshipIds = new Set(
        studentsData.map(s => {
          const intern = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
          return intern.id;
        }).filter(Boolean)
      );

      // 2. Fetch Recent Pre-Internship Documents
      const { data: recentDocs } = await supabase
        .from('pre_internship_documents')
        .select('id, document_name, submitted_at, status, internship_id')
        .order('submitted_at', { ascending: false })
        .limit(30);

      // 3. Fetch Recent WARs
      const { data: recentWARs } = await supabase
        .from('weekly_activity_reports')
        .select('id, week_number, week_label, submitted_at, status, internship_id')
        .order('submitted_at', { ascending: false })
        .limit(30);

      // Process Stats
      const totalStudents = studentsData.length;
      const deployedStudents = studentsData.filter(s => {
        const intern = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
        return intern.is_deployed;
      }).length;

      // Filter recent documents that belong to this adviser's students and are PENDING
      const filteredPendingDocs = (recentDocs || []).filter(
        d => studentInternshipIds.has(d.internship_id) && d.status === 'PENDING'
      );
      const pendingDocCount = filteredPendingDocs.length;

      const evaluationsDue = studentsData.filter(s => {
        const intern = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
        return intern.current_stage === 'POST_INTERNSHIP';
      }).length;

      setStats([
        { title: "Total Students", value: totalStudents, icon: Users, color: "primary" },
        { title: "Deployed", value: deployedStudents, icon: FileCheck, color: "success" },
        { title: "Pending Doc Reviews", value: pendingDocCount, icon: AlertCircle, color: "warning" },
        { title: "Evaluations Due", value: evaluationsDue, icon: FileText, color: "info" }
      ]);

      // Process Activities Feed (merge and sort recent documents and WARs)
      const feedItems = [];

      // Map Documents
      (recentDocs || [])
        .filter(d => studentInternshipIds.has(d.internship_id))
        .forEach(d => {
          const student = studentsData.find(s => {
            const intern = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
            return intern.id === d.internship_id;
          });
          const studentName = student ? `${student.first_name} ${student.last_name}` : 'A student';
          
          let message = '';
          if (d.status === 'PENDING') {
            message = `${studentName} submitted "${d.document_name}" for review.`;
          } else if (d.status === 'APPROVED') {
            message = `${studentName}'s "${d.document_name}" was approved.`;
          } else if (d.status === 'REJECTED') {
            message = `${studentName}'s "${d.document_name}" was rejected.`;
          } else {
            return;
          }

          feedItems.push({
            id: `doc-${d.id}`,
            type: 'Application',
            message,
            timestamp: d.submitted_at ? formatTimeAgo(new Date(d.submitted_at)) : 'Recent',
            dateObj: d.submitted_at ? new Date(d.submitted_at) : new Date(0),
            read: d.status !== 'PENDING'
          });
        });

      // Map WARs
      (recentWARs || [])
        .filter(w => studentInternshipIds.has(w.internship_id))
        .forEach(w => {
          const student = studentsData.find(s => {
            const intern = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
            return intern.id === w.internship_id;
          });
          const studentName = student ? `${student.first_name} ${student.last_name}` : 'A student';
          
          let message = '';
          if (w.status === 'PENDING') {
            message = `${studentName} submitted ${w.week_label || `Week ${w.week_number}`} WAR.`;
          } else if (w.status === 'APPROVED') {
            message = `${studentName}'s ${w.week_label || `Week ${w.week_number}`} WAR was approved.`;
          } else if (w.status === 'REJECTED') {
            message = `${studentName}'s ${w.week_label || `Week ${w.week_number}`} WAR was rejected.`;
          } else {
            return;
          }

          feedItems.push({
            id: `war-${w.id}`,
            type: 'WAR',
            message,
            timestamp: w.submitted_at ? formatTimeAgo(new Date(w.submitted_at)) : 'Recent',
            dateObj: w.submitted_at ? new Date(w.submitted_at) : new Date(0),
            read: w.status !== 'PENDING'
          });
        });

      // Sort and take top 5
      feedItems.sort((a, b) => b.dateObj - a.dateObj);
      setActivities(feedItems.slice(0, 5));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.program_id, user?.professor_sections]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    welcomeBanner: {
      display: 'flex',
      justifyContent: 'space-between',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: theme.colors.white,
      padding: '2.25rem 2rem',
      borderRadius: '16px',
      boxShadow: theme.shadows.md,
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
      alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
      gap: window.innerWidth <= 768 ? '1rem' : '0',
    },
    welcomeText: {
      h2: {
        fontSize: '1.625rem',
        fontWeight: 700,
        color: theme.colors.white,
        marginBottom: '0.5rem',
      },
      p: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.875rem',
      }
    },
    quickActions: {
      display: 'flex',
      gap: '1rem',
    },
    dashboardBtn: (type, isHovered) => ({
      ...commonStyles.dashboardBtn,
      padding: '0.625rem 1.25rem',
      borderRadius: '30px',
      fontSize: '0.875rem',
      fontWeight: '600',
      backgroundColor: type === 'primary' 
        ? (isHovered ? 'rgba(255, 255, 255, 0.9)' : '#ffffff')
        : (isHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)'),
      color: type === 'primary' ? '#1e40af' : '#ffffff',
      border: type === 'primary' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: type === 'secondary' ? 'blur(4px)' : 'none',
      transform: isHovered ? 'translateY(-1px)' : 'none',
    }),
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '1.5rem',
      alignItems: 'start',
    },
    card: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      h3: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: theme.colors.textMain,
      }
    },
    btnLink: (isHovered) => ({
      background: 'none',
      border: 'none',
      color: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      fontWeight: 500,
      fontSize: '0.875rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: theme.transitions.default,
    }),
    feedList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    feedItem: (isHovered, isRead) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '0.75rem',
      borderRadius: '8px',
      transition: theme.transitions.default,
      position: 'relative',
      backgroundColor: isHovered ? theme.colors.bgSecondary : 'transparent',
    }),
    feedIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    feedContent: {
      flex: 1,
    },
    feedMessage: {
      fontSize: '0.875rem',
      color: theme.colors.textMain,
      marginBottom: '0.25rem',
    },
    feedTime: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      backgroundColor: theme.colors.danger,
      borderRadius: '50%',
      position: 'absolute',
      top: '12px',
      right: '12px',
    },
    shortcutsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    shortcutItem: (isHovered) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '1.5rem',
      backgroundColor: isHovered ? theme.colors.bgAccent : theme.colors.bgPrimary,
      border: `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: theme.transitions.default,
      color: isHovered ? theme.colors.primary : theme.colors.textMain,
      transform: isHovered ? 'translateY(-2px)' : 'none',
      span: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textAlign: 'center',
      }
    })
  };

  if (loading) {
    return <PageLoader message="Loading adviser dashboard..." />;
  }

  return (
    <div style={styles.container}>
      {/* Welcome Card */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeText}>
          <h2 style={styles.welcomeText.h2}>Welcome back, {user?.first_name || 'Professor'}!</h2>
          <p style={styles.welcomeText.p}>{user?.course_code || 'All'} OJT Adviser • {user?.department || 'Department'}</p>
        </div>
        <div style={styles.quickActions}>
          <button 
            style={styles.dashboardBtn('primary', hoveredBtn === 'review')} 
            onMouseEnter={() => setHoveredBtn('review')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/ojt-professor/approvals')}
          >
            Review Listings
          </button>
          <button 
            style={styles.dashboardBtn('secondary', hoveredBtn === 'report')} 
            onMouseEnter={() => setHoveredBtn('report')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/ojt-professor/reports')}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div style={styles.dashboardGrid}>
        {/* Recent Activity */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Recent Activity</h3>
            <button 
              style={styles.btnLink(hoveredBtn === 'viewAll')}
              onMouseEnter={() => setHoveredBtn('viewAll')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => navigate('/ojt-professor/notifications')}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.feedList}>
            {activities.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: theme.colors.textMuted }}>
                <Activity size={36} style={{ margin: '0 auto 12px', opacity: 0.3, color: theme.colors.textMuted }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent student activity found.</p>
              </div>
            ) : (
              activities.map((notif) => (
                <div 
                  key={notif.id} 
                  style={styles.feedItem(hoveredFeedItem === notif.id, notif.read)}
                  onMouseEnter={() => setHoveredFeedItem(notif.id)}
                  onMouseLeave={() => setHoveredFeedItem(null)}
                >
                  <div style={styles.feedIcon}>
                    {notif.type === 'Application' && <FileText size={16} />}
                    {notif.type === 'WAR' && <Activity size={16} />}
                    {!['Application', 'WAR'].includes(notif.type) && <AlertCircle size={16} />}
                  </div>
                  <div style={styles.feedContent}>
                    <p style={styles.feedMessage}>{notif.message}</p>
                    <span style={styles.feedTime}>{notif.timestamp}</span>
                  </div>
                  {!notif.read && <span style={styles.unreadDot}></span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Quick Actions</h3>
          </div>
          <div style={styles.shortcutsGrid}>
            {[
              { label: 'View Students', icon: Users, path: '/ojt-professor/students', id: 'students' },
              { label: 'Approve Listings', icon: FileCheck, path: '/ojt-professor/approvals', id: 'approvals' },
              { label: 'Track Applications', icon: FileText, path: '/ojt-professor/applications', id: 'apps' },
              { label: 'Monitoring & Logs', icon: Activity, path: '/ojt-professor/monitoring', id: 'monitoring' },
              { label: 'View Reports', icon: BarChart2, path: '/ojt-professor/reports', id: 'reports' }
            ].map((item) => (
              <button 
                key={item.id}
                style={styles.shortcutItem(hoveredShortcut === item.id)} 
                onMouseEnter={() => setHoveredShortcut(item.id)}
                onMouseLeave={() => setHoveredShortcut(null)}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={24} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
