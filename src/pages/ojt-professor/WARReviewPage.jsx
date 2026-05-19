// src/pages/ojt-professor/WARReviewPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, MessageSquare, User, ChevronDown, ChevronUp, FileText, Calendar, Layers } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { ojtProfessorService } from '../../services/ojtProfessorService';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/common/PageLoader';
import Toast from '../../components/common/Toast';

const STATUS_CONFIG = {
  APPROVED: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={13} /> },
  PENDING:  { label: 'Pending',  color: '#d97706', bg: '#fef9c3', icon: <Clock size={13} /> },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={13} /> },
};

export default function WARReviewPage() {
  const { user } = useAuth();
  const { showToast } = useOutletContext() || {};
  const [wars, setWars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  
  // Hierarchical expansion states
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [expandedWarId, setExpandedWarId] = useState(null);
  
  const [comments, setComments] = useState({});
  const [localToast, setLocalToast] = useState(null);

  const notify = (msg, type) => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  const fetchWARs = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await ojtProfessorService.getWARQueue(user.id);
      setWars(data);
    } catch (err) {
      console.error('Error fetching weekly reports:', err);
      notify('Failed to load Weekly Activity Reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWARs();
  }, [fetchWARs]);

  const handleAction = async (id, action) => {
    if (action === 'REJECTED' && !comments[id]?.trim()) {
      notify('Please provide a comment/feedback before rejecting.', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const commentText = comments[id] || '';
      await ojtProfessorService.updateWARStatus(id, action, commentText, user.id);
      
      setComments(prev => ({ ...prev, [id]: '' }));
      setExpandedWarId(null);
      notify(`WAR ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully.`, action === 'APPROVED' ? 'success' : 'info');
      await fetchWARs();
    } catch (err) {
      console.error('Error updating weekly report:', err);
      notify('Failed to update report status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Group wars by Section and Student based on status filter
  const filteredWars = wars.filter(w => filter === 'ALL' || w.status === filter);
  const pendingCount = wars.filter(w => w.status === 'PENDING').length;

  // Extract all sections assigned to this professor from user object
  const assignedSections = user?.professor_sections?.map(ps => ({
    id: ps.section_id || ps.program_sections?.id,
    name: ps.program_sections?.name || 'Assigned Section'
  })).filter(s => s.id) || [];

  const sectionsList = [];
  const sectionsMap = {};

  // First, initialize sectionsMap with all assigned sections so they are displayed even if no wars are uploaded
  assignedSections.forEach(sec => {
    if (!sectionsMap[sec.id]) {
      sectionsMap[sec.id] = {
        id: sec.id,
        name: sec.name,
        studentsMap: {},
        studentsList: []
      };
      sectionsList.push(sectionsMap[sec.id]);
    }
  });

  // Then, group wars as before
  filteredWars.forEach(war => {
    const sId = war.sectionId || 'unassigned';
    const sName = war.sectionName || 'Not Assigned';
    const stId = war.studentId || 'unknown';
    const stName = war.studentName || 'Unknown Student';

    if (!sectionsMap[sId]) {
      sectionsMap[sId] = {
        id: sId,
        name: sName,
        studentsMap: {},
        studentsList: []
      };
      sectionsList.push(sectionsMap[sId]);
    }

    const sec = sectionsMap[sId];
    if (!sec.studentsMap[stId]) {
      sec.studentsMap[stId] = {
        id: stId,
        name: stName,
        wars: []
      };
      sec.studentsList.push(sec.studentsMap[stId]);
    }

    sec.studentsMap[stId].wars.push(war);
  });

  // Sort sections and students alphabetically
  sectionsList.sort((a, b) => a.name.localeCompare(b.name));
  sectionsList.forEach(sec => {
    sec.studentsList.sort((a, b) => a.name.localeCompare(b.name));
    // Sort student's WARs by week number descending
    sec.studentsList.forEach(st => {
      st.wars.sort((a, b) => b.weekNumber - a.weekNumber);
    });
  });

  const styles = {
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
    studentRow: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      cursor: 'pointer',
      backgroundColor: isOpen ? '#f1f5f9' : '#ffffff',
      borderBottom: `1px solid ${theme.colors.border}80`,
      marginLeft: '16px',
      marginRight: '16px',
      borderRadius: '8px',
      marginTop: '8px',
      marginBottom: '8px',
      transition: 'all 0.2s ease',
    }),
    warRow: (isOpen, status) => {
      const isRejected = status === 'REJECTED';
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        cursor: 'pointer',
        backgroundColor: isOpen ? '#f8fafc' : isRejected ? '#fff5f5' : '#ffffff',
        border: isOpen ? `1px solid ${theme.colors.primary}50` : isRejected ? '1px solid #fecaca' : `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        marginLeft: '32px',
        marginRight: '32px',
        marginBottom: '10px',
        transition: 'all 0.2s ease',
      };
    },
    warDetails: {
      padding: '18px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      marginLeft: '32px',
      marginRight: '32px',
      marginBottom: '16px',
      border: `1px solid ${theme.colors.border}`,
      borderTop: 'none',
      marginTop: '-12px',
    },
    badge: (bg, color) => ({
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 700,
      backgroundColor: bg,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
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

  if (loading && wars.length === 0) return <PageLoader message="Loading weekly activity reports..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>WAR Review</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Review Weekly Activity Reports grouped by section and student.</p>
        </div>
        {pendingCount > 0 && (
          <span style={{ padding: '6px 16px', borderRadius: '20px', backgroundColor: '#fef9c3', color: '#92400e', fontWeight: 700, fontSize: '0.875rem' }}>
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: theme.colors.bgSecondary, padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button key={f} onClick={() => {
            setFilter(f);
            setExpandedSectionId(null);
            setExpandedStudentId(null);
            setExpandedWarId(null);
          }}
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
              backgroundColor: filter === f ? '#fff' : 'transparent', color: filter === f ? theme.colors.primary : theme.colors.textMuted,
              boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Grouped Content */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sectionsList.length === 0 && (
          <div style={{ ...commonStyles.dashboardCard, padding: '40px', textAlign: 'center', color: theme.colors.textMuted }}>
            <FileText size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No Weekly Activity Reports match this filter.</p>
          </div>
        )}

        {sectionsList.map(sec => {
          const isSectionOpen = expandedSectionId === sec.id;
          const totalSectionWARs = sec.studentsList.reduce((acc, curr) => acc + curr.wars.length, 0);

          return (
            <div key={sec.id} style={styles.sectionCard}>
              {/* Section Header */}
              <div 
                style={styles.sectionHeader(isSectionOpen)}
                onClick={() => {
                  setExpandedSectionId(isSectionOpen ? null : sec.id);
                  setExpandedStudentId(null);
                  setExpandedWarId(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.colors.textMain }}>{sec.name}</span>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '2px' }}>
                      {sec.studentsList.length} {sec.studentsList.length === 1 ? 'student' : 'students'} • {totalSectionWARs} reports
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={styles.countBadge}>{totalSectionWARs} WARs</span>
                  {isSectionOpen ? <ChevronUp size={18} color={theme.colors.textMuted} /> : <ChevronDown size={18} color={theme.colors.textMuted} />}
                </div>
              </div>

              {/* Students List under Section */}
              {isSectionOpen && (
                <div style={{ paddingBottom: '12px', backgroundColor: '#fcfcfd' }}>
                  {sec.studentsList.map(student => {
                    const isStudentOpen = expandedStudentId === student.id;

                    return (
                      <div key={student.id}>
                        {/* Student Row */}
                        <div 
                          style={styles.studentRow(isStudentOpen)}
                          onClick={() => {
                            setExpandedStudentId(isStudentOpen ? null : student.id);
                            setExpandedWarId(null);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={15} />
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.colors.textMain }}>{student.name}</span>
                              <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted, marginLeft: '8px' }}>({student.wars.length} passed)</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.badge('#f1f5f9', theme.colors.textSecondary)}>{student.wars.length} Submitted</span>
                            {isStudentOpen ? <ChevronUp size={15} color={theme.colors.textMuted} /> : <ChevronDown size={15} color={theme.colors.textMuted} />}
                          </div>
                        </div>

                        {/* Student's WAR list */}
                        {isStudentOpen && (
                          <div style={{ paddingBottom: '8px' }}>
                            {student.wars.map(war => {
                              const isWarOpen = expandedWarId === war.id;
                              const st = STATUS_CONFIG[war.status] || { label: war.status, color: '#64748b', bg: '#f1f5f9', icon: null };

                              return (
                                <div key={war.id}>
                                  {/* WAR Timeline Row */}
                                  <div 
                                    style={styles.warRow(isWarOpen, war.status)}
                                    onClick={() => setExpandedWarId(isWarOpen ? null : war.id)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <Calendar size={14} color={theme.colors.textMuted} />
                                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textMain }}>{war.weekLabel}</span>
                                      <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>• Submitted {war.submittedAt}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={styles.badge(st.bg, st.color)}>
                                        {st.icon} {st.label}
                                      </span>
                                      {isWarOpen ? <ChevronUp size={14} color={theme.colors.textMuted} /> : <ChevronDown size={14} color={theme.colors.textMuted} />}
                                    </div>
                                  </div>

                                  {/* Expanded WAR Details Panel */}
                                  {isWarOpen && (
                                    <div style={styles.warDetails}>
                                      {[
                                        { label: 'Week Summary', value: war.summary },
                                        { label: 'Skills Learned', value: war.skillsLearned },
                                        { label: 'Challenges Encountered', value: war.challenges },
                                      ].map(f => (
                                        <div key={f.label} style={{ marginTop: '12px' }}>
                                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                                          <p style={{ margin: 0, fontSize: '0.92rem', color: theme.colors.textMain, lineHeight: 1.6, backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', whiteSpace: 'pre-wrap', border: `1px solid ${theme.colors.border}80` }}>{f.value}</p>
                                        </div>
                                      ))}

                                      {war.fileUrl && (
                                        <div style={{ marginTop: '14px' }}>
                                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attachment</div>
                                          <button onClick={() => window.open(war.fileUrl, '_blank')}
                                            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', justifyContent: 'center', padding: '8px' }}>
                                            <FileText size={14} /> View Uploaded Signed WAR (PDF/Image)
                                          </button>
                                        </div>
                                      )}

                                      {war.status === 'PENDING' && (
                                        <div style={{ marginTop: '16px', borderTop: `1px dashed ${theme.colors.border}`, paddingTop: '14px' }}>
                                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>
                                            <MessageSquare size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Feedback / Comment
                                          </label>
                                          <textarea placeholder="Write feedback for the student..." value={comments[war.id] || ''}
                                            onChange={e => setComments(p => ({ ...p, [war.id]: e.target.value }))}
                                            style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical', marginBottom: '10px', fontSize: '0.85rem' }} />
                                          <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleAction(war.id, 'APPROVED')}
                                              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, backgroundColor: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.8rem' }}>
                                              <CheckCircle size={14} /> Approve WAR
                                            </button>
                                            <button onClick={() => handleAction(war.id, 'REJECTED')}
                                              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1, color: '#dc2626', border: '1px solid #dc2626', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.8rem' }}>
                                              <XCircle size={14} /> Reject WAR
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {war.comment && war.status !== 'PENDING' && (
                                        <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: war.status === 'APPROVED' ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', borderLeft: `4px solid ${war.status === 'APPROVED' ? '#16a34a' : '#ef4444'}` }}>
                                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: war.status === 'APPROVED' ? '#15803d' : '#dc2626', marginBottom: '3px' }}>Coordinator Feedback:</div>
                                          <p style={{ margin: 0, fontSize: '0.82rem', color: war.status === 'APPROVED' ? '#166534' : '#991b1b' }}>{war.comment}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {sec.studentsList.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.textMuted, fontSize: '0.875rem' }}>
                      <FileText size={24} style={{ marginBottom: '8px', opacity: 0.3, display: 'inline-block' }} />
                      <div>No activity reports found for this section.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
