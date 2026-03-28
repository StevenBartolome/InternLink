import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, MoreVertical, 
  Award, FileText, CheckCircle, AlertCircle,
  ArrowUpDown, ChevronRight, User, BookOpen
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockStudents } from '../../services/mocks/coordinatorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const GradeManagementPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter students who have grades or are eligible for grading
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: theme.colors.white,
      padding: '10px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      width: isMobile ? '100%' : '300px',
    },
    input: {
      border: 'none',
      outline: 'none',
      width: '100%',
      fontSize: '0.875rem',
      color: theme.colors.textMain,
    },
    tableContainer: {
      ...commonStyles.dashboardTableContainer,
    },
    table: {
      ...commonStyles.dashboardTable,
    },
    th: {
      ...commonStyles.dashboardTableTh,
    },
    td: {
      ...commonStyles.dashboardTableTd,
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      backgroundColor: theme.colors.bgAccent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    gradeBadge: (score) => ({
      ...commonStyles.dashboardBadge,
      backgroundColor: score >= 90 ? '#DEF7EC' : (score >= 75 ? '#E1EFFE' : '#FEF3C7'),
      color: score >= 90 ? '#03543F' : (score >= 75 ? '#1E429F' : '#92400E'),
    }),
    actionBtn: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.colors.textMuted,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: theme.colors.bgSecondary,
        color: theme.colors.primary,
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Grade Management</h1>
        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <Search size={18} />
            <input 
              style={styles.input} 
              placeholder="Search student or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
            onClick={() => showToast && showToast('Filter options coming soon', 'info')}
          >
            <Filter size={18} />
            Filter
          </button>
          <button 
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
            onClick={() => showToast && showToast('Exporting grades to Excel...', 'success')}
          >
            <Download size={18} />
            Export Grades
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Course</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>OJT Hours</th>
              <th style={styles.th}>Final Grade</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr 
                key={student.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/coordinator/students/${student.id}`)}
              >
                <td style={styles.td}>
                  <div style={styles.studentInfo}>
                    <div style={styles.avatar}>{student.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{student.id}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>{student.course}</td>
                <td style={styles.td}>{student.company || 'Not Placed'}</td>
                <td style={styles.td}>{student.renderedHours || 0} / {student.requiredHours || 400}</td>
                <td style={styles.td}>
                  {student.grade ? (
                    <span style={styles.gradeBadge(student.grade)}>{student.grade}%</span>
                  ) : (
                    <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>Pending</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ 
                    ...commonStyles.dashboardBadge,
                    ...(student.status === 'Completed' ? commonStyles.badgeSuccess : 
                       student.status === 'Placed' ? commonStyles.badgeInfo : commonStyles.badgeWarning)
                  }}>
                    {student.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      style={styles.actionBtn} 
                      title="View Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/coordinator/students/${student.id}`);
                      }}
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      style={styles.actionBtn} 
                      title="Edit Grade" 
                      onClick={() => showToast && showToast(`Grade updated for ${student.name}`, 'success')}
                    >
                      <Award size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeManagementPage;
