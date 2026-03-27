import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle, 
  XCircle, ExternalLink, AlertCircle
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { verificationsList } from '../../services/mocks/adminMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Toast from '../../components/common/Toast';

const AccountVerificationPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [verifications, setVerifications] = useState(verificationsList);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleApprove = (id, name) => {
    setVerifications(prev =>
      prev.map(v => v.id === id ? { ...v, status: 'Approved', remarks: null } : v)
    );
    showToast(`${name}'s account has been approved successfully.`, 'success');
  };

  const handleReject = (id, name) => {
    setVerifications(prev =>
      prev.map(v => v.id === id ? { ...v, status: 'Rejected', remarks: 'Rejected by admin.' } : v)
    );
    showToast(`${name}'s account has been rejected.`, 'error');
  };

  const handleViewDocument = (docName) => {
    showToast(`Opening document: ${docName}`, 'info');
  };

  const handleViewHistory = (name) => {
    showToast(`Viewing full history for ${name}.`, 'info');
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
      alignItems: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
    },
    requestCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    docBox: {
      padding: '12px',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
    }
  };

  return (
    <div style={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>Account Verifications</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ ...commonStyles.dashboardBadge, backgroundColor: theme.colors.bgAccent, color: theme.colors.primary }}>
            {verifications.filter(v => v.status === 'Pending').length} Pending
          </span>
        </div>
      </header>

      <div style={styles.grid}>
        {verifications.map(req => (
          <div key={req.id} style={styles.requestCard}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{req.organization}</h3>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>{req.name} • {req.role}</span>
              </div>
              <span style={{ 
                ...commonStyles.dashboardBadge,
                ...(req.status === 'Approved' ? commonStyles.badgeSuccess : 
                   req.status === 'Pending' ? commonStyles.badgeWarning : commonStyles.badgeDanger)
              }}>
                {req.status}
              </span>
            </div>

            <div style={styles.docBox}>
              <div style={{ color: theme.colors.primary }}><FileText size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{req.document}</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Submitted on {req.dateSubmitted}</div>
              </div>
              <button
                title="View document"
                style={{ background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer' }}
                onClick={() => handleViewDocument(req.document)}
              >
                <ExternalLink size={16} />
              </button>
            </div>

            {req.remarks && (
              <div style={{ display: 'flex', gap: '8px', color: theme.colors.danger, fontSize: '0.8rem', backgroundColor: '#FEF2F2', padding: '8px', borderRadius: '8px' }}>
                <AlertCircle size={14} />
                <span>{req.remarks}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${theme.colors.border}` }}>
              {req.status === 'Pending' ? (
                <>
                  <button
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1 }}
                    onClick={() => handleApprove(req.id, req.name)}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, color: theme.colors.danger, flex: 1 }}
                    onClick={() => handleReject(req.id, req.name)}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              ) : (
                <button
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }}
                  onClick={() => handleViewHistory(req.name)}
                >
                  View Full History
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountVerificationPage;
