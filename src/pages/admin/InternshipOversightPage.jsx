import React, { useState } from 'react';
import { 
  Briefcase, Building2, 
  Flag, CheckCircle, 
  ExternalLink, Users, Shield
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { internshipListings } from '../../data/adminMockData';
import Toast from '../../components/coordinator/Toast';

const InternshipOversightPage = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [listings, setListings] = useState(internshipListings);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const filteredListings = filterStatus === 'All' 
    ? listings 
    : listings.filter(l => l.status === filterStatus);

  const handleResolve = (id, title) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Active', remarks: null } : l));
    showToast(`Issue resolved for "${title}". Listing is now Active.`, 'success');
  };

  const handleViewPosting = (title) => {
    showToast(`Viewing full posting details for: ${title}`, 'info');
  };

  const handleActions = (title, status) => {
    if (status === 'Active') {
      showToast(`Flagging "${title}" for review.`, 'warning');
      setListings(prev => prev.map(l => l.title === title ? { ...l, status: 'Flagged', remarks: 'Manually flagged by admin.' } : l));
    } else if (status === 'Pending') {
      setListings(prev => prev.map(l => l.title === title ? { ...l, status: 'Active' } : l));
      showToast(`"${title}" has been approved and is now Active.`, 'success');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
    },
    listingCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    flagBox: {
      display: 'flex',
      gap: '8px',
      color: theme.colors.danger,
      fontSize: '0.8rem',
      backgroundColor: '#FEF2F2',
      padding: '10px',
      borderRadius: '8px',
      borderLeft: `4px solid ${theme.colors.danger}`,
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Internship Oversight</h1>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: theme.colors.bgSecondary, padding: '4px', borderRadius: '12px' }}>
          {['Pending', 'Flagged', 'Active', 'All'].map(s => (
            <button 
              key={s} 
              style={{ 
                padding: '6px 12px', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                backgroundColor: filterStatus === s ? theme.colors.white : 'transparent',
                color: filterStatus === s ? theme.colors.primary : theme.colors.textMuted,
                boxShadow: filterStatus === s ? theme.shadows.sm : 'none',
              }}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <div style={styles.grid}>
        {filteredListings.map(listing => (
          <div key={listing.id} style={styles.listingCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{listing.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: theme.colors.textMuted, marginTop: '4px' }}>
                  <Building2 size={14} />
                  <span>{listing.company} • {listing.industry}</span>
                </div>
              </div>
              <span style={{ 
                ...commonStyles.dashboardBadge,
                ...(listing.status === 'Active' ? commonStyles.badgeSuccess : 
                   listing.status === 'Pending' ? commonStyles.badgeWarning : 
                   listing.status === 'Flagged' ? commonStyles.badgeDanger : commonStyles.badgeInfo)
              }}>
                {listing.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: theme.colors.textMuted }}>
                <Users size={16} />
                <span>{listing.slots} Slots Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: theme.colors.textMuted }}>
                <Shield size={16} />
                <span>Verified Entity</span>
              </div>
            </div>

            {listing.status === 'Flagged' && (
              <div style={styles.flagBox}>
                <Flag size={14} />
                <span><strong>Resolution Required:</strong> {listing.remarks}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${theme.colors.border}` }}>
              <button
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }}
                onClick={() => handleViewPosting(listing.title)}
              >
                <ExternalLink size={16} />
                View Posting
              </button>
              {listing.status === 'Flagged' ? (
                <button
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1 }}
                  onClick={() => handleResolve(listing.id, listing.title)}
                >
                  <CheckCircle size={16} /> Resolve Issue
                </button>
              ) : (
                <button
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
                  onClick={() => handleActions(listing.title, listing.status)}
                >
                  {listing.status === 'Pending' ? 'Approve' : 'Flag'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InternshipOversightPage;
