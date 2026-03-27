import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { mockStudents } from '../../data/coordinatorMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const StudentDirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.id.includes(searchTerm);
    const matchesCourse = courseFilter === 'All' || student.course === courseFilter;
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openProfile = (student) => {
    setSelectedStudent(student);
  };

  const closeProfile = () => {
    setSelectedStudent(null);
  };

  const styles = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    filtersBar: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: '1rem',
      padding: '1rem 1.5rem',
      flexDirection: isMobile ? 'column' : 'row',
    },
    searchWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      maxWidth: isMobile ? 'none' : '400px',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      padding: '0.5rem 0.75rem',
    },
    searchIcon: {
      color: theme.colors.textMuted,
      marginRight: '8px',
    },
    searchInput: {
      background: 'none',
      border: 'none',
      fontSize: '0.875rem',
      color: theme.colors.textMain,
      width: '100%',
      outline: 'none',
    },
    filtersGroup: {
      display: 'flex',
      gap: '1rem',
      flexDirection: isMobile ? 'column' : 'row',
    },
    filterItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: theme.colors.bgSecondary,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
      select: {
        background: 'none',
        border: 'none',
        color: theme.colors.textMain,
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        outline: 'none',
      }
    },
    tableRow: (isHovered) => ({
      cursor: 'pointer',
      transition: theme.transitions.default,
      backgroundColor: isHovered ? theme.colors.bgSecondary : 'transparent',
    }),
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    avatarSmall: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    studentName: {
      display: 'block',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    studentId: {
      display: 'block',
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    companyInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    companyName: {
      fontWeight: 500,
      color: theme.colors.textMain,
    },
    supervisorName: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    hoursText: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
      display: 'block',
      marginTop: '0.25rem',
    },
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: '16px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    modalHeader: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      h3: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: theme.colors.textMain,
      }
    },
    modalCloseBtn: {
      background: 'none',
      border: 'none',
      color: theme.colors.textMuted,
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '50%',
      transition: theme.transitions.default,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBody: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    profileHeaderModal: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
    },
    avatarLarge: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `3px solid ${theme.colors.bgAccent}`,
    },
    profileHeaderTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      margin: 0,
    },
    profileHeaderText: {
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
      marginBottom: '0.25rem',
    },
    profileDetailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
      backgroundColor: theme.colors.bgSecondary,
      padding: '1.25rem',
      borderRadius: '12px',
    },
    detailsSection: {
      h5: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: theme.colors.textMain,
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
      p: {
        fontSize: '0.875rem',
        color: theme.colors.textMain,
        marginBottom: '0.5rem',
        strong: {
          color: theme.colors.textMuted,
          fontWeight: 500,
        }
      }
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    }
  };

  return (
    <div style={styles.page}>
      {/* Filters Bar */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filtersGroup}>
          <div style={styles.filterItem}>
            <Filter size={16} />
            <select 
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
              style={styles.filterItem.select}
            >
              <option value="All">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSBA">BSBA</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <Filter size={16} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterItem.select}
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Unplaced">Unplaced</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div style={commonStyles.dashboardTableContainer}>
        <table style={commonStyles.dashboardTable}>
          <thead>
            <tr>
              <th style={commonStyles.dashboardTableTh}>Name / ID</th>
              <th style={commonStyles.dashboardTableTh}>Course</th>
              <th style={commonStyles.dashboardTableTh}>Status</th>
              <th style={commonStyles.dashboardTableTh}>Assigned Company</th>
              <th style={commonStyles.dashboardTableTh}>Hours Progress</th>
              <th style={commonStyles.dashboardTableTh}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr 
                key={student.id} 
                style={styles.tableRow(hoveredRow === student.id)} 
                onMouseEnter={() => setHoveredRow(student.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => openProfile(student)}
              >
                <td style={commonStyles.dashboardTableTd}>
                  <div style={styles.studentInfo}>
                    <img src={student.avatar} alt={student.name} style={styles.avatarSmall} />
                    <div>
                      <span style={styles.studentName}>{student.name}</span>
                      <span style={styles.studentId}>{student.id}</span>
                    </div>
                  </div>
                </td>
                <td style={commonStyles.dashboardTableTd}>{student.course} ({student.yearLevel})</td>
                <td style={commonStyles.dashboardTableTd}><StatusBadge status={student.status} /></td>
                <td style={commonStyles.dashboardTableTd}>
                  {student.company ? (
                    <div style={styles.companyInfo}>
                      <span style={styles.companyName}>{student.company}</span>
                      <span style={styles.supervisorName}>{student.supervisor}</span>
                    </div>
                  ) : (
                    <span style={{ color: theme.colors.textMuted }}>Not Placed</span>
                  )}
                </td>
                <td style={commonStyles.dashboardTableTd}>
                  <ProgressBar value={student.hoursRendered} max={student.hoursRequired} size="sm" />
                  <span style={styles.hoursText}>{student.hoursRendered}/{student.hoursRequired} hrs</span>
                </td>
                <td style={commonStyles.dashboardTableTd}>
                  <button 
                    style={{...commonStyles.dashboardBtnSecondary, padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px'}} 
                    onClick={(e) => { e.stopPropagation(); openProfile(student); }}
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div style={styles.modalBackdrop} onClick={closeProfile}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalHeader.h3}>Student Profile</h3>
              <button style={styles.modalCloseBtn} onClick={closeProfile}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.profileHeaderModal}>
                <img src={selectedStudent.avatar} alt={selectedStudent.name} style={styles.avatarLarge} />
                <div className="profile-header-text">
                  <h4 style={styles.profileHeaderTitle}>{selectedStudent.name}</h4>
                  <p style={styles.profileHeaderText}>{selectedStudent.id} • {selectedStudent.course}</p>
                  <StatusBadge status={selectedStudent.status} />
                </div>
              </div>

              <div style={styles.profileDetailsGrid}>
                <div style={styles.detailsSection}>
                  <h5 style={styles.detailsSection.h5}>Academic Info</h5>
                  <p style={styles.detailsSection.p}><strong style={styles.detailsSection.p.strong}>Year Level:</strong> {selectedStudent.yearLevel}</p>
                  <p style={styles.detailsSection.p}><strong style={styles.detailsSection.p.strong}>Skills:</strong> {selectedStudent.skills.join(', ')}</p>
                </div>
                
                {selectedStudent.company && (
                  <div style={styles.detailsSection}>
                    <h5 style={styles.detailsSection.h5}>Internship Info</h5>
                    <p style={styles.detailsSection.p}><strong style={styles.detailsSection.p.strong}>Company:</strong> {selectedStudent.company}</p>
                    <p style={styles.detailsSection.p}><strong style={styles.detailsSection.p.strong}>Supervisor:</strong> {selectedStudent.supervisor}</p>
                    <p style={styles.detailsSection.p}><strong style={styles.detailsSection.p.strong}>Hours Rendered:</strong> {selectedStudent.hoursRendered} / {selectedStudent.hoursRequired}</p>
                    <ProgressBar value={selectedStudent.hoursRendered} max={selectedStudent.hoursRequired} />
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button style={{...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary}}>View Resume</button>
                <button style={{...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary}} onClick={closeProfile}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDirectoryPage;
