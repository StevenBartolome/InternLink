import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, CheckSquare, Clock } from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import { mockAttendanceSummary } from '../../services/mocks/ojtProfessorMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ProgressMonitoringPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [completionFilter, setCompletionFilter] = useState('All');
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const students = mockAttendanceSummary;

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const pct = (student.hoursRendered / student.hoursRequired) * 100;
    let matchesCompletion = true;
    if (completionFilter === 'High') matchesCompletion = pct >= 80;
    else if (completionFilter === 'Mid') matchesCompletion = pct >= 50 && pct < 80;
    else if (completionFilter === 'Low') matchesCompletion = pct < 50;

    return matchesSearch && matchesCompletion;
  });

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    filtersBar: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.5rem',
      flexWrap: 'wrap',
    },
    searchWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      maxWidth: '400px',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      padding: '0.5rem 0.75rem',
    },
    searchInput: {
      background: 'none',
      border: 'none',
      paddingLeft: '24px',
      fontSize: '0.875rem',
      color: theme.colors.textMain,
      width: '100%',
      outline: 'none',
    },
    searchIcon: {
      color: theme.colors.textMuted,
      position: 'absolute',
      left: '10px',
    },
    filtersGroup: {
      display: 'flex',
      gap: '1rem',
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
    },
    select: {
      background: 'none',
      border: 'none',
      color: theme.colors.textMain,
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      outline: 'none',
    },
    progressGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
    },
    card: (isHovered) => ({
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      cursor: 'pointer',
      transition: theme.transitions.default,
      transform: isHovered ? 'translateY(-4px)' : 'none',
      boxShadow: isHovered ? '0 6px 16px rgba(0,0,0,0.1)' : theme.shadows.sm,
    }),
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    studentName: {
      fontSize: '1rem',
      fontWeight: 600,
      color: theme.colors.textMain,
      margin: 0,
    },
    companyText: {
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
      margin: 0,
    },
    stats: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: theme.colors.textMuted,
    },
    statValue: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    divider: {
      height: '1px',
      backgroundColor: theme.colors.border,
      margin: '0.25rem 0',
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: `1px solid ${theme.colors.border}`,
      paddingTop: '0.75rem',
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    btnLink: {
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontWeight: 600,
      fontSize: '0.75rem',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0}}>During Internship Monitoring</h1>
      {/* Filters Bar */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search student or company..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={styles.filtersGroup}>
          <div style={styles.filterItem}>
            <Filter size={16} />
            <select style={styles.select} value={completionFilter} onChange={(e) => setCompletionFilter(e.target.value)}>
              <option value="All">All Progress</option>
              <option value="High">80%+ Complete</option>
              <option value="Mid">50% - 79% Complete</option>
              <option value="Low">Below 50%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div style={styles.progressGrid}>
        {filteredStudents.map((student) => (
          <div 
            key={student.id} 
            style={styles.card(hoveredCard === student.id)} 
            onMouseEnter={() => setHoveredCard(student.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(`/ojt-professor/students/${student.id}?tab=progress`)}
          >
            <div style={styles.cardHeader}>
              <img src={student.avatar} alt={student.name} style={styles.avatar} />
              <div>
                <h4 style={styles.studentName}>{student.name}</h4>
                <p style={styles.companyText}>{student.company}</p>
              </div>
            </div>

            <div style={styles.stats}>
              <div style={styles.statRow}>
                <div style={styles.statLabel}>
                   <Clock size={16} /> Hours Rendered
                </div>
                <div style={styles.statValue}>{student.hoursRendered} / {student.hoursRequired}</div>
              </div>
              <ProgressBar value={student.hoursRendered} max={student.hoursRequired} />

              <div style={styles.divider}></div>

              <div style={styles.statRow}>
                <div style={styles.statLabel}>
                   <CheckSquare size={16} /> Tasks done
                </div>
                <div style={styles.statValue}>{student.taskCompletionRate}</div>
              </div>

              <div style={styles.statRow}>
                <div style={styles.statLabel}>
                   <Calendar size={16} /> Attendance Rate
                </div>
                <div style={styles.statValue}>{student.attendanceRate}</div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <span>Last active: {student.lastActivityDate}</span>
              <button style={styles.btnLink}>View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressMonitoringPage;
