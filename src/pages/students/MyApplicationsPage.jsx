import React, { useState } from 'react';
import { 
  FileText, Clock, CheckCircle2, 
  XCircle, Filter, Search, 
  ChevronRight, ArrowRight, Building2,
  Calendar, ExternalLink, MoreVertical
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { applicationRecords } from '../../data/mockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const MyApplicationsPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [filter, setFilter] = useState('All');

  const filteredApps = filter === 'All' 
    ? applicationRecords 
    : applicationRecords.filter(app => app.status === filter);

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
    filterBar: {
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      paddingBottom: '8px',
    },
    appList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    appCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: '20px',
      padding: '24px',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateX(4px)',
        borderColor: theme.colors.primary,
      }
    },
    companyInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    statusBadge: (status) => {
      const colors = {
        Approved: commonStyles.badgeSuccess,
        Pending: commonStyles.badgeWarning,
        Rejected: commonStyles.badgeDanger,
        Shortlisted: commonStyles.badgeInfo,
      };
      return {
        ...commonStyles.dashboardBadge,
        ...(colors[status] || commonStyles.badgeInfo),
      };
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>My Applications</h1>
        <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>Total: {applicationRecords.length}</span>
      </header>

      <div style={styles.filterBar}>
        {['All', 'Approved', 'Pending', 'Rejected', 'Shortlisted'].map(f => (
          <button 
            key={f} 
            style={{ 
              ...commonStyles.dashboardBtn, 
              backgroundColor: filter === f ? theme.colors.primary : theme.colors.bgSecondary,
              color: filter === f ? '#fff' : theme.colors.textMuted,
              borderRadius: '20px',
              padding: '8px 20px',
            }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={styles.appList}>
        {filteredApps.map(app => (
          <div key={app.id} style={styles.appCard}>
            <div style={styles.companyInfo}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifySelf: 'center', color: theme.colors.primary, fontWeight: 800 }}>
                {app.company.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{app.position}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: theme.colors.textMuted, marginTop: '4px' }}>
                  <Building2 size={14} />
                  <span>{app.company}</span>
                  <span>•</span>
                  <Calendar size={14} />
                  <span>Applied {app.dateApplied}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
              <span style={styles.statusBadge(app.status)}>{app.status}</span>
              <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, padding: '10px' }}>
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplicationsPage;
