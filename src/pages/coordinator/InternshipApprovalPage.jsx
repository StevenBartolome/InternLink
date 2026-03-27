import React, { useState } from 'react';
import { 
  CheckSquare, XCircle, Search, 
  MapPin, Clock, Building2, 
  ExternalLink, ChevronRight, FileCheck,
  MoreVertical, Filter
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockEmployerListings } from '../../data/coordinatorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternshipApprovalPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [filter, setFilter] = useState('Pending');

  const filteredListings = mockEmployerListings.filter(listing => 
    filter === 'All' || listing.status === filter
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
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
    },
    listingCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    companyBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    companyLogo: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: theme.colors.bgAccent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.primary,
      fontWeight: 800,
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Internship Approvals</h1>
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
        {filteredListings.map(listing => (
          <div key={listing.id} style={styles.listingCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={styles.companyBar}>
                <div style={styles.companyLogo}>{listing.companyName.charAt(0)}</div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{listing.position}</h3>
                  <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>{listing.companyName}</span>
                </div>
              </div>
              <span style={{ 
                ...commonStyles.dashboardBadge,
                ...(listing.status === 'Approved' ? commonStyles.badgeSuccess : 
                   listing.status === 'Pending' ? commonStyles.badgeWarning : commonStyles.badgeDanger)
              }}>
                {listing.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: theme.colors.textMuted }}>
                <MapPin size={16} />
                <span>{listing.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: theme.colors.textMuted }}>
                <Clock size={16} />
                <span>{listing.type}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: theme.colors.textMain, margin: '8px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {listing.description || 'No description provided for this internship listing.'}
            </p>

            <div style={styles.actions}>
              {listing.status === 'Pending' ? (
                <>
                  <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, backgroundColor: theme.colors.success }}>
                    <FileCheck size={18} />
                    Approve
                  </button>
                  <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1, color: theme.colors.danger }}>
                    <XCircle size={18} />
                    Reject
                  </button>
                </>
              ) : (
                <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }}>
                  <ExternalLink size={18} />
                  View Listing Details
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
