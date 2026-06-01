import React, { useState } from 'react';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import CreateStudentModal from '../../components/ojt-professor/CreateStudentModal';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/common/PageLoader';

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
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  
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
            companies ( name ),
            additional_requirements ( document_name, status, reviewer_comment )
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
        
        let calculatedHours = 0;
        let hasSignedReports = false;
        const addReqs = internship.additional_requirements || [];
        addReqs.forEach(req => {
          if (req.document_name && req.document_name.startsWith('Signed Attendance Report') && req.status !== 'NOT_SUBMITTED') {
            hasSignedReports = true;
            if (req.reviewer_comment) {
              const match = req.reviewer_comment.match(/\[HOURS:([0-9.]+)\]/);
              if (match) calculatedHours += parseFloat(match[1]);
            }
          }
        });

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
          hoursRendered: hasSignedReports ? calculatedHours : (internship.rendered_hours || 0),
          hoursRequired: profile.programs?.required_hours || 486,
          section: profile.program_sections?.name || 'Not Assigned',
          sectionId: profile.section_id || 'unassigned',
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
  }, [user?.program_id, user?.professor_sections, showToast]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useRealtimeSubscription(
    ['users', 'student_internships', 'student_profiles'],
    fetchStudents
  );

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
    
    return matchesSearch && matchesStatus && matchesSection;
  });

  // Group students by section
  const assignedSections = user?.professor_sections?.map(ps => ({
    id: ps.section_id || ps.program_sections?.id,
    name: ps.program_sections?.name || 'Assigned Section'
  })).filter(s => s.id) || [];

  const sectionsList = [];
  const sectionsMap = {};

  // First, initialize with assigned sections so they display
  assignedSections.forEach(sec => {
    if (!sectionsMap[sec.id]) {
      sectionsMap[sec.id] = {
        id: sec.id,
        name: sec.name,
        students: []
      };
      sectionsList.push(sectionsMap[sec.id]);
    }
  });

  // Then group the filtered students
  filteredStudents.forEach(student => {
    let sId = student.sectionId || 'unassigned';
    let sName = student.section || 'Not Assigned';

    // Extract completed students into their own section
    if (student.status === 'Completed') {
      sId = 'completed_students';
      sName = 'Completed Students';
    }

    if (!sectionsMap[sId]) {
      sectionsMap[sId] = {
        id: sId,
        name: sName,
        students: []
      };
      sectionsList.push(sectionsMap[sId]);
    }

    sectionsMap[sId].students.push(student);
  });

  // Sort sections and students alphabetically
  sectionsList.sort((a, b) => a.name.localeCompare(b.name));
  sectionsList.forEach(sec => {
    sec.students.sort((a, b) => a.name.localeCompare(b.name));
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
    },
    sectionCard: {
      ...commonStyles.dashboardCard,
      padding: 0,
      overflow: 'hidden',
      border: `1px solid ${theme.colors.border}`,
      marginBottom: '16px',
      transition: 'box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
    },
    sectionHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      cursor: 'pointer',
      backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
      borderBottom: isOpen ? `1px solid ${theme.colors.border}` : 'none',
      transition: 'background-color 0.2s ease',
    }),
    countBadge: {
      padding: '3px 8px',
      borderRadius: '12px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.textSecondary,
      fontSize: '0.72rem',
      fontWeight: 700,
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

      {/* Grouped Students List */}
      <div>
        {loading ? (
          <PageLoader message="Loading directory list..." />
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.textMuted }}>
            <p style={{ marginBottom: '1rem' }}>No students found matching filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sectionsList.map(sec => {
              const isSectionOpen = expandedSectionId === sec.id;
              const matchCount = sec.students.length;

              // Filter check: If sectionFilter is set and doesn't match this section name, skip
              if (sectionFilter !== 'All' && sec.name !== sectionFilter) {
                return null;
              }

              // Also, if we have a search term or status filter, and this section has 0 matches, hide it
              if ((searchTerm || statusFilter !== 'All') && matchCount === 0) {
                return null;
              }

              return (
                <div key={sec.id} style={styles.sectionCard}>
                  {/* Section Header */}
                  <div 
                    style={styles.sectionHeader(isSectionOpen)}
                    onClick={() => setExpandedSectionId(isSectionOpen ? null : sec.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={18} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.colors.textMain }}>{sec.name}</span>
                        <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '2px' }}>
                          {matchCount} {matchCount === 1 ? 'student' : 'students'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={styles.countBadge}>{matchCount} Students</span>
                      {isSectionOpen ? <ChevronUp size={18} color={theme.colors.textMuted} /> : <ChevronDown size={18} color={theme.colors.textMuted} />}
                    </div>
                  </div>

                  {/* Section Content: Table */}
                  {isSectionOpen && (
                    <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderTop: `1px solid ${theme.colors.border}` }}>
                      {matchCount === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.textMuted, fontSize: '0.875rem' }}>
                          No students found matching current filters in this section.
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
                            {sec.students.map((student) => (
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
                  )}
                </div>
              );
            })}
          </div>
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
