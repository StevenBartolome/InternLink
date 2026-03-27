// src/pages/employer/ManageListingsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Power, RefreshCw } from 'lucide-react';
import { internshipListings } from '../../data/employerMockData';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ManageListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState(internshipListings);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const toggleStatus = (id) => {
    setListings(listings.map(listing => {
      if (listing.id === id) {
        return {
          ...listing,
          status: listing.status === 'Active' ? 'Inactive' : 'Active'
        };
      }
      return listing;
    }));
  };

  const handleEdit = (listing) => {
    navigate('/employer/post', { state: { listing } });
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '0 1.5rem 1.5rem 1.5rem', // Removed top padding
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      h1: {
        fontSize: '24px',
        fontWeight: 700,
        color: theme.colors.textMain,
        margin: '0 0 4px 0',
      },
      subtitle: {
        color: theme.colors.textMuted,
        fontSize: '14px',
        margin: 0,
      }
    },
    btnPrimary: (isHovered) => ({
      ...commonStyles.dashboardBtn,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: isHovered ? theme.colors.primaryHover : theme.colors.primary,
      color: theme.colors.white,
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      transition: theme.transitions.default,
    }),
    tableCard: {
      ...commonStyles.dashboardCard,
      padding: 0,
      overflow: 'hidden',
    },
    tableResponsive: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      th: {
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: 600,
        color: theme.colors.textMuted,
        backgroundColor: '#f9fafb',
        borderBottom: `1px solid ${theme.colors.border}`,
      },
      td: {
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: '14px',
        color: theme.colors.textMain,
      }
    },
    subText: {
      fontSize: '12px',
      color: theme.colors.textMuted,
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
    },
    btnIcon: (id, type, isDisabled) => {
      const isHovered = hoveredBtn === id;
      let color = theme.colors.textMuted;
      if (type === 'danger') color = isHovered ? theme.colors.danger : theme.colors.textMuted;
      else if (type === 'success') color = isHovered ? theme.colors.success : theme.colors.textMuted;
      else if (isHovered) color = theme.colors.primary;

      return {
        background: 'none',
        border: 'none',
        padding: '6px',
        borderRadius: '4px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        color: isDisabled ? '#cbd5e1' : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: theme.transitions.default,
        backgroundColor: isHovered && !isDisabled ? theme.colors.bgSecondary : 'transparent',
      };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.header.h1}>Manage Internship Listings</h1>
          <p style={styles.header.subtitle}>View and manage your posted internship positions.</p>
        </div>
        <button 
          style={styles.btnPrimary(hoveredBtn === 'post')} 
          onMouseEnter={() => setHoveredBtn('post')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={() => navigate('/employer/post')}
        >
          <Plus size={18} /> Post New Internship
        </button>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.table.th}>Job Title</th>
                <th style={styles.table.th}>Department</th>
                <th style={styles.table.th}>Slots</th>
                <th style={styles.table.th}>Date Posted</th>
                <th style={styles.table.th}>Status</th>
                <th style={styles.table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id}>
                  <td style={styles.table.td}>
                    <div style={{ fontWeight: 600 }}>{listing.jobTitle}</div>
                    <div style={styles.subText}>{listing.location}</div>
                  </td>
                  <td style={styles.table.td}>{listing.department}</td>
                  <td style={styles.table.td}>{listing.slotsAvailable}</td>
                  <td style={styles.table.td}>{listing.datePosted}</td>
                  <td style={styles.table.td}><StatusBadge status={listing.status} /></td>
                  <td style={styles.table.td}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.btnIcon(`${listing.id}-edit`)} 
                        title="Edit"
                        onMouseEnter={() => setHoveredBtn(`${listing.id}-edit`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => handleEdit(listing)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        style={styles.btnIcon(
                          `${listing.id}-toggle`, 
                          listing.status === 'Active' ? 'danger' : 'success',
                          listing.status === 'Pending Approval'
                        )} 
                        title={listing.status === 'Active' ? 'Deactivate' : 'Activate'}
                        onMouseEnter={() => setHoveredBtn(`${listing.id}-toggle`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => toggleStatus(listing.id)}
                        disabled={listing.status === 'Pending Approval'}
                      >
                        <Power size={16} />
                      </button>
                      <button 
                        style={styles.btnIcon(`${listing.id}-repost`)} 
                        title="Repost"
                        onMouseEnter={() => setHoveredBtn(`${listing.id}-repost`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageListingsPage;
