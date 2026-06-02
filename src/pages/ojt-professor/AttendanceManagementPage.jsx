import React, { useState } from 'react';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Layers, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import PageLoader from '../../components/common/PageLoader';

const AttendanceManagementPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [availableSections, setAvailableSections] = useState([]);
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  
  // Modal state
  const [selectedPdfStudent, setSelectedPdfStudent] = useState(null);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const { showToast } = useOutletContext() || {};

  const fetchStudents = React.useCallback(async () => {
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
            id, current_stage, rendered_hours, is_deployed,
            additional_requirements ( id, document_name, status, file_url, reviewer_comment )
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
        
        const addReqs = internship.additional_requirements || [];
        let hasSignedReports = false;
        let pdfUrls = [];
        let calculatedHours = 0;
        
        addReqs.forEach(req => {
          if (req.document_name && req.document_name.startsWith('Signed Attendance Report') && req.status !== 'NOT_SUBMITTED') {
            hasSignedReports = true;
            if (req.file_url) pdfUrls.push({ url: req.file_url, name: req.document_name });
            if (req.reviewer_comment) {
              const match = req.reviewer_comment.match(/\[HOURS:([0-9.]+)\]/);
              if (match) calculatedHours += parseFloat(match[1]);
            }
          }
        });

        if (!hasSignedReports) return null;

        return {
          id: s.id,
          studentId: profile.student_id || 'Not Set',
          name: `${s.first_name} ${s.last_name}`,
          course: profile.programs?.code || 'Not Assigned',
          yearLevel: profile.year_level || 'Not Set',
          internshipId: internship.id,
          isDeployed: internship.is_deployed || false,
          hoursRendered: hasSignedReports ? calculatedHours : (internship.rendered_hours || 0),
          hoursRequired: profile.programs?.required_hours || 486,
          section: profile.program_sections?.name || 'Not Assigned',
          sectionId: profile.section_id || 'unassigned',
          pdfUrls,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.first_name + ' ' + s.last_name)}&background=random`
        };
      }).filter(Boolean);

      setStudents(transformed);
      
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
    ['users', 'student_internships', 'student_profiles', 'attendance_logs'],
    fetchStudents
  );



  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
    
    return matchesSearch && matchesSection;
  });

  const assignedSections = user?.professor_sections?.map(ps => ({
    id: ps.section_id || ps.program_sections?.id,
    name: ps.program_sections?.name || 'Assigned Section'
  })).filter(s => s.id) || [];

  const sectionsList = [];
  const sectionsMap = {};

  assignedSections.forEach(sec => {
    if (!sectionsMap[sec.id]) {
      sectionsMap[sec.id] = { id: sec.id, name: sec.name, students: [] };
      sectionsList.push(sectionsMap[sec.id]);
    }
  });

  filteredStudents.forEach(student => {
    let sId = student.sectionId || 'unassigned';
    let sName = student.section || 'Not Assigned';

    if (!sectionsMap[sId]) {
      sectionsMap[sId] = { id: sId, name: sName, students: [] };
      sectionsList.push(sectionsMap[sId]);
    }

    sectionsMap[sId].students.push(student);
  });

  sectionsList.sort((a, b) => a.name.localeCompare(b.name));
  sectionsList.forEach(sec => {
    sec.students.sort((a, b) => a.name.localeCompare(b.name));
  });

  const styles = {
    page: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    filtersBar: {
      ...commonStyles.dashboardCard,
      display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
      gap: '1rem', padding: '1rem 1.5rem', flexDirection: isMobile ? 'column' : 'row',
    },
    searchWrapper: {
      position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: isMobile ? 'none' : '400px',
      backgroundColor: theme.colors.bgSecondary, borderRadius: '8px', border: `1px solid ${theme.colors.border}`, padding: '0.5rem 0.75rem',
    },
    searchInput: { background: 'none', border: 'none', fontSize: '0.875rem', color: theme.colors.textMain, width: '100%', outline: 'none' },
    filtersGroup: { display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' },
    filterItem: {
      display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: theme.colors.bgSecondary,
      border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: theme.colors.textMuted,
      select: { background: 'none', border: 'none', color: theme.colors.textMain, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', outline: 'none' }
    },
    sectionCard: {
      ...commonStyles.dashboardCard, padding: 0, overflow: 'hidden', border: `1px solid ${theme.colors.border}`, marginBottom: '16px',
    },
    sectionHeader: (isOpen) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer',
      backgroundColor: isOpen ? '#f8fafc' : '#ffffff', borderBottom: isOpen ? `1px solid ${theme.colors.border}` : 'none',
    }),
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
    },
    statusBadge: (status) => {
      const isLogged = status === 'LOGGED';
      const isProgress = status === 'IN_PROGRESS';
      return {
        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
        backgroundColor: isLogged ? '#dcfce7' : (isProgress ? '#e0f2fe' : '#fee2e2'),
        color: isLogged ? '#15803d' : (isProgress ? '#0369a1' : '#dc2626')
      }
    }
  };

  return (
    <div style={styles.page}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 }}>Attendance Management</h2>
        <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Review student attendance logs and manage deducted hours.</p>
      </div>

      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={{ color: theme.colors.textMuted, marginRight: '8px' }} />
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

              if (sectionFilter !== 'All' && sec.name !== sectionFilter) return null;
              if (searchTerm && matchCount === 0) return null;

              return (
                <div key={sec.id} style={styles.sectionCard}>
                  <div style={styles.sectionHeader(isSectionOpen)} onClick={() => setExpandedSectionId(isSectionOpen ? null : sec.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={18} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.colors.textMain }}>{sec.name}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: theme.colors.textMuted }}>
                      {matchCount} Students
                    </div>
                  </div>

                  {isSectionOpen && (
                    <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderTop: `1px solid ${theme.colors.border}` }}>
                      {matchCount === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.textMuted }}>No students found.</div>
                      ) : (
                        <table style={commonStyles.dashboardTable}>
                          <thead>
                            <tr>
                              <th style={commonStyles.dashboardTableTh}>Name / ID</th>
                              <th style={commonStyles.dashboardTableTh}>Course / Section</th>
                              <th style={commonStyles.dashboardTableTh}>Deployment</th>
                              <th style={commonStyles.dashboardTableTh}>Total Hours</th>
                              <th style={commonStyles.dashboardTableTh}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sec.students.map((student) => (
                              <tr key={student.id}>
                                <td style={commonStyles.dashboardTableTd}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <img src={student.avatar} alt={student.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                    <div>
                                      <span style={{ display: 'block', fontWeight: 600, color: theme.colors.textMain }}>{student.name}</span>
                                      <span style={{ display: 'block', fontSize: '0.75rem', color: theme.colors.textMuted }}>{student.studentId}</span>
                                    </div>
                                  </div>
                                </td>
                                <td style={commonStyles.dashboardTableTd}>
                                  <div>{student.course} ({student.yearLevel})</div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.colors.primary }}>{student.section}</div>
                                </td>
                                <td style={commonStyles.dashboardTableTd}>
                                  {student.isDeployed ? (
                                    <span style={{ color: theme.colors.success, fontSize: '0.75rem', fontWeight: 700 }}>DEPLOYED</span>
                                  ) : (
                                    <span style={{ color: theme.colors.warning, fontSize: '0.75rem', fontWeight: 700 }}>PENDING</span>
                                  )}
                                </td>
                                <td style={commonStyles.dashboardTableTd}>
                                  <ProgressBar value={student.hoursRendered} max={student.hoursRequired} size="sm" />
                                  <span style={{ display: 'block', fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '4px' }}>
                                    {student.hoursRendered}/{student.hoursRequired} hrs
                                  </span>
                                </td>
                                <td style={commonStyles.dashboardTableTd}>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    {student.pdfUrls && student.pdfUrls.length > 0 && (
                                      <button 
                                        style={{...commonStyles.dashboardBtnPrimary, padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px'}} 
                                        onClick={() => setSelectedPdfStudent(student)}
                                      >
                                        View PDFs ({student.pdfUrls.length})
                                      </button>
                                    )}
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

      {/* PDFs Modal */}
      {selectedPdfStudent && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPdfStudent(null)}>
          <div style={{ ...styles.modal, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Attendance Reports</h3>
                <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                  {selectedPdfStudent.name}
                </p>
              </div>
              <button onClick={() => setSelectedPdfStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: theme.colors.textMuted }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedPdfStudent.pdfUrls.map((pdf, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.colors.textMain }}>{pdf.name}</span>
                  <button 
                    onClick={() => window.open(pdf.url, '_blank')}
                    style={{ ...commonStyles.dashboardBtnPrimary, padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagementPage;
