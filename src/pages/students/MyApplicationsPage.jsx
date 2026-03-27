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
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState(applicationRecords);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredApps = filter === 'All' 
    ? apps 
    : apps.filter(app => app.status === filter);

  const handleCancelApplication = (id) => {
    setIsDeleting(true);
    setTimeout(() => {
      setApps(prev => prev.filter(app => app.id !== id));
      setSelectedApp(null);
      setIsDeleting(false);
    }, 1000);
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
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '32px',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '600px',
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      maxHeight: '90vh',
      overflowY: 'auto',
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
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary, fontWeight: 800 }}>
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
              <button 
                onClick={() => setSelectedApp(app)}
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, padding: '10px' }}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div style={styles.modalOverlay} onClick={() => !isDeleting && setSelectedApp(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedApp(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
            >
              <XCircle size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary, fontWeight: 800, fontSize: '1.5rem' }}>
                {selectedApp.company.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{selectedApp.position}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textMuted, marginTop: '4px' }}>
                  <Building2 size={16} />
                  <span style={{ fontWeight: 600 }}>{selectedApp.company}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div style={{ padding: '16px', backgroundColor: theme.colors.bgSecondary, borderRadius: '16px' }}>
                <div style={{ ...styles.label, marginBottom: '4px' }}>Current Status</div>
                <span style={styles.statusBadge(selectedApp.status)}>{selectedApp.status}</span>
              </div>
              <div style={{ padding: '16px', backgroundColor: theme.colors.bgSecondary, borderRadius: '16px' }}>
                <div style={{ ...styles.label, marginBottom: '4px' }}>Applied Date</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedApp.dateApplied}</div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700 }}>Cover Letter Snippet</h4>
              <p style={{ margin: 0, color: theme.colors.textMuted, lineHeight: 1.6, fontSize: '0.95rem', fontStyle: 'italic' }}>
                "{selectedApp.coverLetter || 'I am very interested in this position and look forward to contributing to your team...'}"
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, padding: '14px' }}
                onClick={() => setSelectedApp(null)}
              >
                Done
              </button>
              {selectedApp.status === 'Pending' && (
                <button 
                  disabled={isDeleting}
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, color: theme.colors.danger, flex: 1, padding: '14px' }}
                  onClick={() => handleCancelApplication(selectedApp.id)}
                >
                  {isDeleting ? 'Cancelling...' : 'Withdraw Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
