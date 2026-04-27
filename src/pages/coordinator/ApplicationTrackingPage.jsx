import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, Filter, Calendar, 
  CheckCircle, XCircle, Clock, 
  ExternalLink, FileText, ChevronRight,
  Target, Briefcase, GraduationCap
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockEmployerListings } from '../../services/mocks/coordinatorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ApplicationTrackingPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('all');

  // Simulated applications derived from mockEmployerListings for tracking
  const mockApplications = [
    { id: 'APP001', student: 'Alice Johnson', company: 'Google', position: 'Frontend Intern', date: '2023-10-15', status: 'Pending' },
    { id: 'APP002', student: 'Bob Smith', company: 'Microsoft', position: 'Backend Intern', date: '2023-10-16', status: 'Shortlisted' },
    { id: 'APP003', student: 'Charlie Brown', company: 'Amazon', position: 'Cloud Engineer', date: '2023-10-14', status: 'Approved' },
    { id: 'APP004', student: 'David Wilson', company: 'Meta', position: 'Data Science Intern', date: '2023-10-12', status: 'Rejected' },
  ];

  const filteredApps = activeTab === 'all' ? mockApplications : mockApplications.filter(app => app.status.toLowerCase() === activeTab);

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
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      borderBottom: `1px solid ${theme.colors.border}`,
      paddingBottom: '2px',
    },
    tab: (isActive) => ({
      padding: '12px 20px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      borderBottom: isActive ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
      transition: 'all 0.2s ease',
    }),
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px',
    },
    appCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: isMobile ? '100%' : '400px',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    statusBadge: (status) => {
      const colors = {
        pending: { bg: '#FEF3C7', text: '#92400E' },
        shortlisted: { bg: '#E1EFFE', text: '#1E429F' },
        approved: { bg: '#DEF7EC', text: '#03543F' },
        rejected: { bg: '#FDE8E8', text: '#9B1C1C' },
      };
      const color = colors[status.toLowerCase()] || { bg: '#F3F4F6', text: '#374151' };
      return {
        ...commonStyles.dashboardBadge,
        backgroundColor: color.bg,
        color: color.text,
      };
    },
    detailRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
      paddingTop: '16px',
      borderTop: `1px solid ${theme.colors.border}`,
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Application Tracking</h1>
        <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>Total: {mockApplications.length}</span>
      </header>

      <div style={styles.tabs}>
        {['All', 'Pending', 'Shortlisted', 'Approved', 'Rejected'].map(status => (
          <div 
            key={status} 
            style={styles.tab(activeTab === status.toLowerCase())}
            onClick={() => setActiveTab(status.toLowerCase())}
          >
            {status}
          </div>
        ))}
      </div>

      <div style={styles.cardGrid}>
        {filteredApps.map(app => (
          <div key={app.id} style={styles.appCard}>
            <div style={styles.cardHeader}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: theme.colors.bgAccent, borderRadius: '12px', color: theme.colors.primary }}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{app.student}</h3>
                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{app.id}</span>
                </div>
              </div>
              <span style={styles.statusBadge(app.status)}>{app.status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={styles.detailRow}>
                <Briefcase size={16} />
                <span>{app.position} at <strong>{app.company}</strong></span>
              </div>
              <div style={styles.detailRow}>
                <Calendar size={16} />
                <span>Applied on {app.date}</span>
              </div>
            </div>

            <div style={styles.actions}>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1 }}
                onClick={() => showToast ? showToast(`Opening resume for ${app.student}...`, 'info') : alert(`Opening resume for ${app.student}...`)}
              >
                <FileText size={16} />
                View File
              </button>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
                title="Open Company Portal"
                onClick={() => showToast ? showToast(`Redirecting to ${app.company} portal...`, 'info') : alert(`Redirecting to ${app.company} portal...`)}
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationTrackingPage;
