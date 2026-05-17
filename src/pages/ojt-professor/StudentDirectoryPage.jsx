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
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const STATUS_MAP = {
  'PRE_INTERNSHIP': 'Pre-Internship',
  'DURING_INTERNSHIP': 'During Internship',
  'POST_INTERNSHIP': 'Post-Internship',
  'COMPLETED': 'Completed'
};

const StudentDirectoryPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [availableSections, setAvailableSections] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { showToast } = useOutletContext() || {};

  const fetchStudents = React.useCallback(async () => {
    if (!user?.program_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Use a single relational query to fetch students belonging to the professor's program
      let query = supabase
        .from('users')
        .select(`
          id, first_name, last_name,
          student_profiles!inner (
            student_id, year_level, program_id, section_id,
            programs ( id, code, name, required_hours ),
            program_sections ( id, name )
          ),
          student_internships!student_id (
            current_stage, rendered_hours, supervisor_name, is_deployed,
            companies ( name )
          )
        `)
        .eq('role', 'student')
        .eq('student_profiles.program_id', user.program_id);

      // If professor has assigned sections, restrict query
      const profSectionIds = user?.professor_sections?.map(ps => ps.section_id) || [];
      if (profSectionIds.length > 0) {
        query = query.in('student_profiles.section_id', profSectionIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformed = data.map(s => {
        // Handle cases where Supabase might return either an array or a single object for 1:1 relationships
        const profile = (Array.isArray(s.student_profiles) ? s.student_profiles[0] : s.student_profiles) || {};
        const internship = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
        const company = internship.companies || {};
        
        return {
          id: s.id,
          studentId: profile.student_id || 'Not Set',
          name: `${s.first_name} ${s.last_name}`,
          course: profile.programs?.code || 'Not Assigned',
          yearLevel: profile.year_level || 'Not Set',
          status: STATUS_MAP[internship.current_stage] || 'Pre-Internship',
          company: company.name || 'Not Applied',
          supervisor: internship.supervisor_name || 'Not Placed',
          isDeployed: internship.is_deployed || false,
          hoursRendered: internship.rendered_hours || 0,
          hoursRequired: profile.programs?.required_hours || 486,
          section: profile.program_sections?.name || 'Not Assigned',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.first_name + ' ' + s.last_name)}&background=random`
        };
      });

      setStudents(transformed);
      
      // Extract unique sections for filtering
      const uniqueSections = [...new Set(transformed.map(s => s.section).filter(sec => sec !== 'Not Assigned'))].sort();
      setAvailableSections(uniqueSections);
    } catch (err) {
      console.error('Error fetching students:', err);
      if (showToast) showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.program_id, showToast]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
    
    return matchesSearch && matchesStatus && matchesSection;
  });

  const openProfile = (student) => {
    navigate(`/ojt-professor/students/${student.id}`);
  };

  const handleSuccess = (message) => {
    if (showToast) showToast(message, 'success');
    fetchStudents(); // Refresh the list
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
      ...commonStyles.dashboardBtn,
      ...commonStyles.dashboardBtnPrimary,
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
            <span style={{ fontWeight: 600, color: theme.colors.primary }}>{user?.course_code || 'All Programs'}</span>
            <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>Fixed to your course</span>
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

          <div style={styles.filterItem}>
            <Filter size={16} />
            <select 
              value={sectionFilter} 
              onChange={(e) => setSectionFilter(e.target.value)}
              style={styles.filterItem.select}
            >
              <option value="All">All Sections</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div style={commonStyles.dashboardTableContainer}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px 20px',
            width: '100%'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: `3px solid ${theme.colors.primary}20`,
              borderTop: `3px solid ${theme.colors.primary}`,
              borderRadius: '50%',
              animation: 'spin-loader 0.8s linear infinite',
              marginBottom: '12px'
            }} />
            <style>{`
              @keyframes spin-loader {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted }}>Loading directory list...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.textMuted }}>
            <p style={{ marginBottom: '1rem' }}>No students found for {user?.course_code || 'this program'}.</p>
            <p style={{ fontSize: '0.75rem' }}>Program ID: <code style={{ backgroundColor: theme.colors.bgSecondary, padding: '2px 4px', borderRadius: '4px' }}>{user?.program_id || 'NOT SET'}</code></p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Total students fetched (unfiltered): {students.length === 0 && !loading ? 'Check console' : students.length}</p>
          </div>
        ) : (
          <table style={commonStyles.dashboardTable}>
            <thead>
              <tr>
                <th style={commonStyles.dashboardTableTh}>Name / ID</th>
                <th style={commonStyles.dashboardTableTh}>Course / Section</th>
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
                        <span style={styles.studentId}>{student.studentId}</span>
                      </div>
                    </div>
                  </td>
                  <td style={commonStyles.dashboardTableTd}>
                    <div>{student.course} ({student.yearLevel})</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.colors.primary }}>{student.section}</div>
                  </td>
                  <td style={commonStyles.dashboardTableTd}><StatusBadge status={student.status} /></td>
                  <td style={commonStyles.dashboardTableTd}>
                    {student.company && student.company !== 'Not Applied' ? (
                      <div style={styles.companyInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={styles.companyName}>{student.company}</span>
                          {!student.isDeployed && (
                            <span style={{ 
                              fontSize: '0.65rem', 
                              backgroundColor: '#fff7ed', 
                              color: '#c2410c', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: 700,
                              border: '1px solid #fed7aa',
                              whiteSpace: 'nowrap'
                            }}>
                              PENDING
                            </span>
                          )}
                        </div>
                        <span style={styles.supervisorName}>{student.supervisor}</span>
                      </div>
                    ) : (
                      <span style={{ color: theme.colors.textMuted }}>Not Applied</span>
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
        )}
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
