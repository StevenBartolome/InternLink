import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, Filter, X, UserPlus, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import CreateStudentModal from '../../components/ojt-professor/CreateStudentModal';
import { mockStudents } from '../../services/mocks/ojtProfessorMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const StudentDirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { showToast } = useOutletContext() || {};

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.id.includes(searchTerm);
    const matchesCourse = courseFilter === 'All' || student.course === courseFilter;
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openProfile = (student) => {
    navigate(`/ojt-professor/students/${student.id}`);
  };

  const handleSuccess = (message) => {
    if (showToast) showToast(message, 'success');
    else alert(message);
    // Ideally we would refresh the list here from Supabase
  };

  const styles = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    headerActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    createBtn: {
      ...commonStyles.dashboardBtnPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.625rem 1.25rem',
      fontSize: '0.875rem',
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
    modalActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerActions}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 }}>Student Directory</h2>
        <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          <UserPlus size={18} /> Create Student Account
        </button>
      </div>

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
              <option value="Pre-Internship">Pre-Internship</option>
              <option value="During Internship">During Internship</option>
              <option value="Post-Internship">Post-Internship</option>
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

      {showCreateModal && (
        <CreateStudentModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default StudentDirectoryPage;
