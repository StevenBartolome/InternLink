// src/pages/admin/DashboardPage.jsx
import React, { useState } from 'react';
import { Users, CheckCircle, Briefcase, AlertTriangle, ArrowRight, UserPlus, FileText, Bell } from 'lucide-react';
import { adminProfile, dashboardStats, auditLogs } from '../../services/mocks/adminMockData';
import StatCard from '../../components/common/StatCard';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { totalUsers, pendingVerifications, activeInternships, systemAlerts, roleDistribution } = dashboardStats;
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [hoveredAction, setHoveredAction] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Get top 5 recent audit logs
  const recentActivity = auditLogs.slice(0, 5);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const handleVerifyAccounts = () => navigate('/admin/verifications');
  const handleViewReports = () => navigate('/admin/reports');
  const handleBroadcast = () => navigate('/admin/notifications');

  const handleViewAllActivity = () => navigate('/admin/audit-logs');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    welcomeBanner: {
      background: theme.gradients.primary,
      color: theme.colors.white,
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: theme.shadows.md,
      h1: {
        fontSize: '1.75rem',
        fontWeight: 700,
        margin: '0 0 0.5rem 0',
      },
      p: {
        margin: '0 0 0.25rem 0',
      },
      welcomeSubtext: {
        opacity: 0.9,
        fontSize: '0.9rem',
        marginTop: '0.25rem',
      }
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
    },
    quickActions: {
      backgroundColor: theme.colors.bgPrimary,
      padding: '1.5rem',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      h3: {
        fontSize: '1rem',
        fontWeight: 600,
        color: theme.colors.textMain,
        margin: '0 0 1rem 0',
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
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        border: isPrimary ? 'none' : `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
        backgroundColor: isPrimary 
          ? (isHovered ? theme.colors.primaryHover : theme.colors.primary)
          : (isHovered ? theme.colors.bgSecondary : theme.colors.bgPrimary),
        color: isPrimary ? theme.colors.white : (isHovered ? theme.colors.primary : theme.colors.textMain),
        fontWeight: 500,
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: theme.transitions.default,
      };
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      gap: '1.5rem',
    },
    dashboardCard: {
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      display: 'flex',
      flexDirection: 'column',
    },
    cardHeader: {
      padding: '1.25rem 1.5rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      h3: {
        fontSize: '1rem',
        fontWeight: 600,
        margin: 0,
      }
    },
    viewAllBtn: {
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontSize: '0.85rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      cursor: 'pointer',
    },
    cardContent: {
      padding: '1.5rem',
      flex: 1,
    },
    distributionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    distributionItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      color: theme.colors.textMuted,
    },
    dot: (role) => {
      const colors = {
        student: theme.colors.primary,
        employer: theme.colors.success,
        supervisor: theme.colors.warning,
        coordinator: '#7c3aed',
      };
      return {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: colors[role.toLowerCase()] || theme.colors.border,
      };
    },
    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    activityItem: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start',
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
        padding: '0.5rem',
        borderRadius: '8px',
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
      gap: '0.15rem',
    },
    activityText: {
      fontSize: '0.875rem',
      color: theme.colors.textMain,
      margin: 0,
    },
    activityTime: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Welcome Card */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.welcomeBanner.h1}>Welcome back, {adminProfile.name}!</h1>
          <p style={styles.welcomeBanner.p}>System: <strong>{adminProfile.systemName}</strong></p>
          <p style={styles.welcomeBanner.welcomeSubtext}>Monitor and manage the OJT program from this central hub.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div style={styles.statsGrid}>
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          icon={Users} 
          color="primary" 
          trend={{ type: 'up', value: '12%', label: 'this month' }} 
        />
        <StatCard 
          title="Pending Verifications" 
          value={pendingVerifications} 
          icon={CheckCircle} 
          color="warning" 
        />
        <StatCard 
          title="Active Internships" 
          value={activeInternships} 
          icon={Briefcase} 
          color="success" 
        />
        <StatCard 
          title="System Alerts" 
          value={systemAlerts} 
          icon={AlertTriangle} 
          color="danger" 
        />
      </div>

      {/* Action Buttons */}
      <div style={styles.quickActions}>
        <h3 style={styles.quickActions.h3}>Quick Actions</h3>
        <div style={styles.actionButtons}>
          <button 
            style={styles.actionBtn('verify', 'secondary')}
            onMouseEnter={() => setHoveredAction('verify')}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={handleVerifyAccounts}
          >
            <CheckCircle size={18} /> Verify Accounts
          </button>
          <button 
            style={styles.actionBtn('reports', 'secondary')}
            onMouseEnter={() => setHoveredAction('reports')}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={handleViewReports}
          >
            <FileText size={18} /> View Reports
          </button>
          <button 
            style={styles.actionBtn('broadcast', 'primary')}
            onMouseEnter={() => setHoveredAction('broadcast')}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={handleBroadcast}
          >
            <Bell size={18} /> Broadcast Announcement
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Grid */}
      <div style={styles.dashboardGrid}>
        {/* Role Distribution */}
        <div style={styles.dashboardCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Role Distribution</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.distributionList}>
              <div style={styles.distributionItem}>
                <div style={styles.itemLabel}><span style={styles.dot('student')}></span> Students</div>
                <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{roleDistribution.students}</div>
              </div>
              <div style={styles.distributionItem}>
                <div style={styles.itemLabel}><span style={styles.dot('employer')}></span> Employers</div>
                <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{roleDistribution.employers}</div>
              </div>
              <div style={styles.distributionItem}>
                <div style={styles.itemLabel}><span style={styles.dot('supervisor')}></span> Supervisors</div>
                <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{roleDistribution.supervisors}</div>
              </div>
              <div style={styles.distributionItem}>
                <div style={styles.itemLabel}><span style={styles.dot('coordinator')}></span> Coordinators</div>
                <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{roleDistribution.coordinators}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.dashboardCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardHeader.h3}>Recent Activity</h3>
            <button style={styles.viewAllBtn} onClick={handleViewAllActivity}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.activityList}>
              {recentActivity.map((log) => (
                <div key={log.id} style={styles.activityItem}>
                  <div style={styles.activityIconBadge(log.type)}>
                    {log.type === 'Create' && <UserPlus size={16} />}
                    {log.type === 'Update' && <FileText size={16} />}
                    {log.type === 'System' && <AlertTriangle size={16} />}
                    {(log.type === 'Login' || log.type === 'Delete') && <Users size={16} />}
                  </div>
                  <div style={styles.activityDetails}>
                    <p style={styles.activityText}>
                      <strong>{log.user}</strong> ({log.role}) {log.action.toLowerCase()}
                    </p>
                    <span style={styles.activityTime}>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
