import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, 
  Award, FileText, AlertCircle,
  ChevronDown, ChevronUp, Layers, Loader2
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import PageLoader from '../../components/common/PageLoader';
import Toast from '../../components/common/Toast';

const STATUS_MAP = {
  'PRE_INTERNSHIP': 'Pre-Internship',
  'DURING_INTERNSHIP': 'Placed',
  'POST_INTERNSHIP': 'Post-Internship',
  'COMPLETED': 'Completed'
};

const GradeManagementPage = () => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  const navigate = useNavigate();
  
  // Data State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [localToast, setLocalToast] = useState(null);

  // Grade Modal State
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newGradeValue, setNewGradeValue] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const notify = useCallback((msg, type) => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  }, [showToast]);

  // Fetch student grade records from Supabase
  const fetchStudents = useCallback(async () => {
    if (!user?.program_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
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
            current_stage, rendered_hours, supervisor_name, is_deployed, final_grade,
            companies ( name )
          )
        `)
        .eq('role', 'student')
        .eq('student_profiles.program_id', user.program_id);

      const profSectionIds = user?.professor_sections?.map(ps => ps.section_id) || [];
      if (profSectionIds.length > 0) {
        query = query.in('student_profiles.section_id', profSectionIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformed = data.map(s => {
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
          sectionId: profile.section_id || 'unassigned',
          grade: internship.final_grade,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.first_name + ' ' + s.last_name)}&background=random`
        };
      });

      setStudents(transformed);
    } catch (err) {
      console.error('Error fetching students for grades:', err);
      notify('Failed to load student grade records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.program_id, user?.professor_sections, notify]);


  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Edit grade click handler
  const handleOpenGradeModal = (e, student) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setNewGradeValue(student.grade !== null && student.grade !== undefined ? student.grade.toString() : '');
    setIsGradeModalOpen(true);
  };

  // Save grade handler
  const handleSaveGrade = async () => {
    if (!selectedStudent) return;
    const gradeNum = parseFloat(newGradeValue);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      notify('Please enter a valid numeric grade between 0 and 100', 'error');
      return;
    }

    try {
      setSavingGrade(true);
      const { error } = await supabase
        .from('student_internships')
        .update({ 
          final_grade: gradeNum,
          final_grade_encoded_at: new Date().toISOString()
        })
        .eq('student_id', selectedStudent.id);

      if (error) throw error;

      notify(`Successfully encoded grade for ${selectedStudent.name}!`, 'success');
      
      // Update local state instantly
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, grade: gradeNum } : s));
      
      setIsGradeModalOpen(false);
      setSelectedStudent(null);
      setNewGradeValue('');
    } catch (err) {
      console.error('Error saving grade:', err);
      notify('Failed to save grade to database', 'error');
    } finally {
      setSavingGrade(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      notify('No grades to export', 'info');
      return;
    }
    
    try {
      const headers = ['Student ID', 'Name', 'Course', 'Section', 'Company', 'OJT Hours Rendered', 'OJT Hours Required', 'Final Grade', 'Status'];
      const rows = filteredStudents.map(student => [
        student.studentId,
        student.name,
        student.course,
        student.section,
        student.company,
        student.hoursRendered,
        student.hoursRequired,
        student.grade ? `${student.grade}%` : 'Pending',
        student.status
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Grades_Export_${user?.course_code || 'OJT'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notify('Grades successfully exported to CSV!', 'success');
    } catch (err) {
      console.error('CSV Export Error:', err);
      notify('Failed to export grades', 'error');
    }
  };

  // Filter student logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group students by section
  const assignedSections = user?.professor_sections?.map(ps => ({
    id: ps.section_id || ps.program_sections?.id,
    name: ps.program_sections?.name || 'Assigned Section'
  })).filter(s => s.id) || [];

  const sectionsList = [];
  const sectionsMap = {};

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

  filteredStudents.forEach(student => {
    const sId = student.sectionId || 'unassigned';
    const sName = student.section || 'Not Assigned';

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

  // Sort sections and students
  sectionsList.sort((a, b) => a.name.localeCompare(b.name));
  sectionsList.forEach(sec => {
    sec.students.sort((a, b) => a.name.localeCompare(b.name));
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        backgroundColor: theme.colors.bgSecondary,
        color: theme.colors.primary,
      }
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
    <div style={styles.container}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      <div style={styles.header}>
        <h1 style={styles.title}>Post-Internship Grading</h1>
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
          
          <div style={styles.filterItem}>
            <Filter size={16} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.select}
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Completed">Completed</option>
              <option value="Pre-Internship">Pre-Internship</option>
              <option value="Post-Internship">Post-Internship</option>
            </select>
          </div>

          <button 
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
            onClick={handleExportCSV}
          >
            <Download size={18} />
            Export Grades
          </button>
        </div>
      </div>

      {/* Grouped Grading Tables */}
      <div>
        {loading ? (
          <PageLoader message="Loading grading records..." />
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', ...commonStyles.dashboardCard, textAlign: 'center', color: theme.colors.textMuted }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No students found matching current filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sectionsList.map(sec => {
              const isSectionOpen = expandedSectionId === sec.id;
              const matchCount = sec.students.length;

              // Hide sections with 0 matches if filtering is active
              if ((searchTerm || filterStatus !== 'All') && matchCount === 0) {
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
                          No students in this section matching filters.
                        </div>
                      ) : (
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
                            {sec.students.map((student) => (
                              <tr 
                                key={student.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/ojt-professor/students/${student.id}`)}
                              >
                                <td style={styles.td}>
                                  <div style={styles.studentInfo}>
                                    <div style={styles.avatar}>{student.name.charAt(0)}</div>
                                    <div>
                                      <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{student.name}</div>
                                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{student.studentId}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={styles.td}>{student.course}</td>
                                <td style={styles.td}>{student.company}</td>
                                <td style={styles.td}>{student.hoursRendered} / {student.hoursRequired}</td>
                                <td style={styles.td}>
                                  {student.grade !== null && student.grade !== undefined ? (
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
                                  <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      style={styles.actionBtn} 
                                      title="View Details"
                                      onClick={() => navigate(`/ojt-professor/students/${student.id}`)}
                                    >
                                      <FileText size={18} />
                                    </button>
                                    <button 
                                      style={styles.actionBtn} 
                                      title="Edit Grade" 
                                      onClick={(e) => handleOpenGradeModal(e, student)}
                                    >
                                      <Award size={18} />
                                    </button>
                                  </div>
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

      {/* Encode Grade Modal */}
      {isGradeModalOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '440px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${theme.colors.border}`,
            position: 'relative',
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 800, color: theme.colors.textMain }}>
              Encode Final Grade
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: theme.colors.textMuted }}>
              Encode or update final grade for <strong>{selectedStudent.name}</strong> ({selectedStudent.studentId}).
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Final Grade (%)
              </label>
              <input 
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 1.25 or 95.00"
                value={newGradeValue}
                onChange={(e) => setNewGradeValue(e.target.value)}
                style={{
                  ...commonStyles.input,
                  width: '100%',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setIsGradeModalOpen(false);
                  setSelectedStudent(null);
                  setNewGradeValue('');
                }}
                style={{
                  ...commonStyles.dashboardBtn,
                  ...commonStyles.dashboardBtnSecondary,
                  padding: '10px 20px',
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGrade}
                disabled={savingGrade}
                style={{
                  ...commonStyles.dashboardBtn,
                  ...commonStyles.dashboardBtnPrimary,
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {savingGrade && <Loader2 size={16} className="animate-spin" />}
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeManagementPage;
