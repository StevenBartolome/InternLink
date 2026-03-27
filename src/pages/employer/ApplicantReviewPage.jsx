// src/pages/employer/ApplicantReviewPage.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Mail, BookOpen, Award, FileText, ChevronRight, User } from 'lucide-react';
import { internshipListings, applicants } from '../../data/employerMockData';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ApplicantReviewPage = () => {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedListingId, setSelectedListingId] = useState(
    location.state?.listingId || internshipListings[0]?.id || ''
  );
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const filteredApplicants = applicants.filter(
    app => app.listingId === selectedListingId
  );

  const handleSelectApplicant = (app) => {
    setSelectedApplicant(app);
  };

  const handleClosePanel = () => {
    setSelectedApplicant(null);
  };

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: 'calc(100vh - 100px)',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '14px',
      margin: 0,
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    select: {
      padding: '10px 16px',
      borderRadius: '12px',
      border: `1.5px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.white,
      color: theme.colors.textMain,
      cursor: 'pointer',
      minWidth: '240px',
      outline: 'none',
    },
    content: {
      display: 'flex',
      gap: '24px',
      flex: 1,
      overflow: 'hidden',
      flexDirection: isMobile ? 'column' : 'row',
    },
    tableSection: {
      flex: selectedApplicant && !isMobile ? '0 0 60%' : '1',
      overflowY: 'auto',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
    },
    th: {
      padding: '16px 20px',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: theme.colors.textMuted,
      backgroundColor: '#f8fafc',
      borderBottom: `1px solid ${theme.colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
    tr: (id, isSelected, isHovered) => ({
      cursor: 'pointer',
      backgroundColor: isSelected ? '#f0f9ff' : isHovered ? '#f8fafc' : 'transparent',
      transition: 'background-color 0.2s',
      borderBottom: `1px solid ${theme.colors.border}`,
    }),
    td: {
      padding: '16px 20px',
      fontSize: '14px',
      color: theme.colors.textMain,
    },
    sidePanel: {
      flex: isMobile ? '1' : '0 0 38%',
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    panelHeader: {
      padding: '20px 24px',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
    },
    panelBody: {
      padding: '24px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    sectionHeader: {
      fontSize: '13px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: theme.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    avatarLg: {
      width: '80px',
      height: '80px',
      borderRadius: '24px',
      backgroundColor: '#dbeafe',
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      fontWeight: 800,
      margin: '0 auto 16px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
    },
    profileCenter: {
      textAlign: 'center',
      paddingBottom: '20px',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    letterBox: {
      backgroundColor: '#f1f5f9',
      padding: '1.25rem',
      borderRadius: '16px',
      fontSize: '0.9rem',
      lineHeight: 1.6,
      color: theme.colors.textMain,
      border: '1px solid #e2e8f0',
    },
    skillChip: {
      backgroundColor: '#eff6ff',
      color: theme.colors.primary,
      padding: '6px 14px',
      borderRadius: '10px',
      fontSize: '0.8rem',
      fontWeight: 700,
      border: '1px solid rgba(59, 130, 246, 0.1)',
    },
    emptyState: {
      padding: '4rem 2rem',
      textAlign: 'center',
      color: theme.colors.textMuted,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Applicant Review</h1>
          <p style={styles.subtitle}>Selection pool for {internshipListings.find(l => l.id === selectedListingId)?.jobTitle || 'selected listing'}</p>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={{ fontWeight: 600, fontSize: '14px', color: theme.colors.textMuted }}>Listing:</label>
          <select 
            value={selectedListingId} 
            onChange={(e) => setSelectedListingId(e.target.value)}
            style={styles.select}
          >
            {internshipListings.map(listing => (
              <option key={listing.id} value={listing.id}>
                {listing.jobTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.tableSection}>
          {filteredApplicants.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Candidate</th>
                  <th style={styles.th}>Education</th>
                  <th style={styles.th}>Applied On</th>
                  <th style={styles.th}>Status</th>
                  {!selectedApplicant && <th style={styles.th}></th>}
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map(app => (
                  <tr 
                    key={app.id} 
                    onClick={() => handleSelectApplicant(app)}
                    onMouseEnter={() => setHoveredRow(app.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={styles.tr(app.id, selectedApplicant?.id === app.id, hoveredRow === app.id)}
                  >
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, color: theme.colors.textMain }}>{app.studentName}</div>
                      <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>{app.studentEmail || 'student@example.com'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{app.course}</div>
                      <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Year {app.yearLevel}</div>
                    </td>
                    <td style={styles.td}>{app.dateApplied}</td>
                    <td style={styles.td}><StatusBadge status={app.status} /></td>
                    {!selectedApplicant && (
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <ChevronRight size={18} color={theme.colors.textMuted} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>
              <User size={48} strokeWidth={1.5} />
              <p>No applicants found for this position yet.</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {selectedApplicant && (
          <div style={styles.sidePanel}>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>CANDIDATE PROFILE</h3>
              <button 
                onClick={handleClosePanel}
                style={{ ...commonStyles.buttonSecondary, padding: '6px', borderRadius: '8px', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.panelBody}>
              <div style={styles.profileCenter}>
                <div style={styles.avatarLg}>
                  {selectedApplicant.studentName.charAt(0)}
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800 }}>{selectedApplicant.studentName}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textMuted }}>
                  {selectedApplicant.course} • Year {selectedApplicant.yearLevel}
                </p>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                  <StatusBadge status={selectedApplicant.status} />
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}><Mail size={14} /> CONTACT INFORMATION</div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{selectedApplicant.studentEmail || 'student.email@example.com'}</p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}><Award size={14} /> CORE SKILLS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(selectedApplicant.skills || ['React', 'Node.js', 'UI Design']).map((skill, index) => (
                    <span key={index} style={styles.skillChip}>{skill}</span>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}><FileText size={14} /> COVER LETTER</div>
                <div style={styles.letterBox}>
                  {selectedApplicant.coverLetter || "I am highly motivated to join your team as an intern. I have a strong background in computer science and I'm eager to apply my skills in a professional setting."}
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}><BookOpen size={14} /> DOCUMENTS</div>
                <a 
                  href={selectedApplicant.resumeLink} 
                  style={{ ...commonStyles.link, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={18} /> View Resume / Portfolio
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantReviewPage;
