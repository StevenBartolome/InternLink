// src/pages/coordinator/InternshipApprovalPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CheckSquare, XCircle, MapPin, Clock, Building2, 
  ExternalLink, FileCheck, User, Briefcase, GraduationCap
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockStudentPlacements } from '../../services/mocks/coordinatorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternshipApprovalPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  const [filter, setFilter] = useState('Pending');
  const [placements, setPlacements] = useState(mockStudentPlacements);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAction = (id, newStatus) => {
    if (newStatus === 'Rejected' && !rejectingId) {
      setRejectingId(id);
      return;
    }

    if (newStatus === 'Rejected' && rejectingId) {
      if (!rejectionReason.trim()) {
        showToast && showToast('Please provide a reason for rejection', 'error');
        return;
      }
      setPlacements(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected', remarks: rejectionReason } : p));
      setRejectingId(null);
      setRejectionReason('');
      showToast && showToast('Placement rejected', 'info');
    } else {
      setPlacements(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast && showToast(`Internship placement ${newStatus}`, 'success');
    }
  };

  const filteredPlacements = placements.filter(p => 
    filter === 'All' || p.status === filter
  );

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
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    filterBar: {
      display: 'flex',
      gap: '8px',
      backgroundColor: theme.colors.bgSecondary,
      padding: '4px',
      borderRadius: '12px',
    },
    filterBtn: (isActive) => ({
      padding: '8px 16px',
      borderRadius: '10px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: isActive ? theme.colors.white : 'transparent',
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '20px',
    },
    card: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: isMobile ? '100%' : '500px',
      border: `1px solid ${theme.colors.border}`,
    },
    studentBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      backgroundColor: theme.colors.bgAccent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.primary,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      fontSize: '0.9rem',
      color: theme.colors.textMain,
    },
    infoIcon: {
      color: theme.colors.primary,
      marginTop: '2px',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
      borderTop: `1px solid ${theme.colors.border}`,
      paddingTop: '16px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student OJT Approvals</h1>
        <div style={styles.filterBar}>
          {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
            <button 
              key={s} 
              style={styles.filterBtn(filter === s)}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        {filteredPlacements.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={styles.studentBar}>
                <div style={styles.avatar}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{p.studentName}</h3>
                  <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>ID: {p.studentId}</span>
                </div>
              </div>
              <span style={{ 
                ...commonStyles.dashboardBadge,
                ...(p.status === 'Approved' ? commonStyles.badgeSuccess : 
                   p.status === 'Pending' ? commonStyles.badgeWarning : commonStyles.badgeDanger)
              }}>
                {p.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
              <div style={styles.infoRow}>
                <Building2 size={18} style={styles.infoIcon} />
                <div>
                  <div style={{ fontWeight: 700 }}>{p.companyName}</div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>{p.position}</div>
                </div>
              </div>
              <div style={styles.infoRow}>
                <MapPin size={18} style={styles.infoIcon} />
                <span>{p.location}</span>
              </div>
              <div style={styles.infoRow}>
                <Clock size={18} style={styles.infoIcon} />
                <span>Duration: <strong>{p.duration}</strong></span>
              </div>
            </div>

            {p.status === 'Rejected' && p.remarks && (
              <div style={{ padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px', borderLeft: `4px solid ${theme.colors.danger}` }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.danger, display: 'block', marginBottom: '4px' }}>Rejection Reason:</span>
                <p style={{ fontSize: '0.85rem', color: '#991B1B', margin: 0 }}>{p.remarks}</p>
              </div>
            )}

            <div style={styles.actions}>
              {p.status === 'Pending' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  {rejectingId === p.id ? (
                    <>
                      <textarea 
                        placeholder="Provide rejection reason..." 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        style={{ ...commonStyles.dashboardInput, minHeight: '80px', fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, backgroundColor: theme.colors.danger }}
                          onClick={() => handleAction(p.id, 'Rejected')}
                        >
                          Confirm Reject
                        </button>
                        <button 
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }}
                          onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, backgroundColor: theme.colors.success }}
                        onClick={() => handleAction(p.id, 'Approved')}
                      >
                        <FileCheck size={18} />
                        Grant Approval
                      </button>
                      <button 
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1, color: theme.colors.danger }}
                        onClick={() => setRejectingId(p.id)}
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }}
                  onClick={() => showToast && showToast(`Viewing placement details for ${p.studentName}...`, 'info')}
                >
                  <ExternalLink size={18} />
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InternshipApprovalPage;
