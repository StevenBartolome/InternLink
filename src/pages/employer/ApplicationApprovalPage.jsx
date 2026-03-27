// src/pages/employer/ApplicationApprovalPage.jsx
import React, { useState } from 'react';
import { Check, X, User, MessageSquare, AlertCircle } from 'lucide-react';
import { applicants } from '../../data/employerMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ApplicationApprovalPage = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [pendingApps, setPendingApps] = useState(
    applicants.filter(app => app.status === 'Pending')
  );
  const [remarks, setRemarks] = useState({});
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleApprove = (id) => {
    setPendingApps(pendingApps.filter(app => app.id !== id));
  };

  const handleReject = (id) => {
    setPendingApps(pendingApps.filter(app => app.id !== id));
    setActiveRejectId(null);
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  const styles = {
    container: {
      padding: '0 24px 24px 24px', // Removed top padding
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      marginBottom: '8px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '14px',
      margin: 0,
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    card: (isHovered) => ({
      ...commonStyles.dashboardCard,
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      boxShadow: isHovered ? theme.shadows.md : theme.shadows.sm,
      borderColor: isHovered ? theme.colors.primary : theme.colors.border,
    }),
    appInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: isMobile ? '1 1 100%' : '1',
    },
    avatar: {
      width: '52px',
      height: '52px',
      borderRadius: '18px',
      backgroundColor: '#f1f5f9',
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 800,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
      border: `1.5px solid ${theme.colors.border}`,
    },
    studentName: {
      margin: 0,
      fontSize: '16px',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    positionText: {
      margin: '2px 0',
      fontSize: '13px',
      color: theme.colors.primary,
      fontWeight: 700,
    },
    dateText: {
      margin: 0,
      fontSize: '12px',
      color: theme.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flex: isMobile ? '1 1 100%' : 'none',
      justifyContent: isMobile ? 'flex-end' : 'flex-start',
    },
    btnApprove: {
      ...commonStyles.buttonPrimary,
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#10b981', // Emerald-500
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    },
    btnReject: {
      ...commonStyles.buttonSecondary,
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.danger,
      backgroundColor: '#fef2f2',
      border: '1.5px solid #fee2e2',
    },
    rejectBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      animation: 'slideDown 0.2s ease',
    },
    remarkInput: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1.5px solid ${theme.colors.border}`,
      fontSize: '14px',
      outline: 'none',
      width: '100%',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s',
      ':focus': {
        borderColor: theme.colors.danger,
        backgroundColor: '#fff',
      }
    },
    confirmActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    emptyState: {
      padding: '5rem 2rem',
      textAlign: 'center',
      color: theme.colors.textMuted,
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px dashed ${theme.colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Application Approvals</h1>
        <p style={styles.subtitle}>Curate your talent pool. You have {pendingApps.length} pending decisions.</p>
      </div>

      <div style={styles.list}>
        {pendingApps.length > 0 ? (
          pendingApps.map(app => (
            <div 
              key={app.id} 
              style={styles.card(hoveredCard === app.id)}
              onMouseEnter={() => setHoveredCard(app.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.appInfo}>
                <div style={styles.avatar}>
                  {app.studentName.charAt(0)}
                </div>
                <div>
                  <h4 style={styles.studentName}>{app.studentName}</h4>
                  <p style={styles.positionText}>{app.position}</p>
                  <p style={styles.dateText}>Applied on {app.dateApplied}</p>
                </div>
              </div>

              <div style={styles.actions}>
                {activeRejectId === app.id ? (
                  <div style={styles.rejectBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.danger, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                      <AlertCircle size={14} /> REJECTION REMARKS
                    </div>
                    <input 
                      type="text" 
                      placeholder="Add specific feedback for the student..." 
                      style={styles.remarkInput}
                      value={remarks[app.id] || ''} 
                      onChange={(e) => handleRemarkChange(app.id, e.target.value)}
                      autoFocus
                    />
                    <div style={styles.confirmActions}>
                      <button 
                        style={{ ...styles.btnApprove, backgroundColor: theme.colors.danger, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }} 
                        onClick={() => handleReject(app.id)}
                      >
                        Confirm Reject
                      </button>
                      <button 
                        style={{ ...styles.btnReject, color: theme.colors.textMuted, border: 'none' }} 
                        onClick={() => setActiveRejectId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button style={styles.btnApprove} onClick={() => handleApprove(app.id)}>
                      <Check size={18} /> Approve
                    </button>
                    <button style={styles.btnReject} onClick={() => setActiveRejectId(app.id)}>
                      <X size={18} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <Check size={48} color="#10b981" strokeWidth={1.5} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>All caught up! No pending applications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationApprovalPage;
