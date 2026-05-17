// src/pages/ojt-professor/DocumentReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, Building2, Rocket, ChevronDown, ChevronUp, AlertCircle, User, Eye, MessageSquare, ExternalLink, Plus, Trash2, RefreshCw } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { ojtProfessorService } from '../../services/ojtProfessorService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const DOC_STATUS = {
  APPROVED: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={13} /> },
  PENDING:  { label: 'Pending',  color: '#d97706', bg: '#fef9c3', icon: <Clock size={13} /> },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={13} /> },
  NOT_SUBMITTED: { label: 'Not Submitted', color: '#64748b', bg: '#f1f5f9', icon: <AlertCircle size={13} /> },
};

const MOA_OPTS = ['NOT_STARTED', 'IN_PROGRESS', 'PROCESSED'];
const MOA_LABELS = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', PROCESSED: 'Processed' };
const MOA_COLORS = { NOT_STARTED: '#94a3b8', IN_PROGRESS: '#d97706', PROCESSED: '#16a34a' };

export default function DocumentReviewPage() {
  const { showToast, user } = useAuth() || {};
  const { showToast: showOutletToast } = useOutletContext() || {};
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null); // For the side panel review
  const [rejectComment, setRejectComment] = useState({});
  const [localToast, setLocalToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

  const [selectedSection, setSelectedSection] = useState('All');
  const [availableSections, setAvailableSections] = useState([]);

  useEffect(() => {
    const profSections = user?.professor_sections?.map(ps => ps.program_sections?.name).filter(Boolean) || [];
    const queueSections = queue.map(s => s.sectionName).filter(name => name && name !== 'Not Assigned');
    const unique = [...new Set([...profSections, ...queueSections])].sort();
    setAvailableSections(unique);
  }, [user, queue]);

  const filteredQueue = queue.filter(student => {
    if (selectedSection === 'All') return true;
    return student.sectionName === selectedSection;
  });

  const notify = (msg, type) => {
    if (showOutletToast) showOutletToast(msg, type);
    else if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await ojtProfessorService.getDocumentQueue();
      setQueue(data);
    } catch (err) {
      console.error('Error fetching document queue:', err);
      notify('Failed to load document queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDocAction = async (studentId, docId, action) => {
    if (action === 'REJECTED' && !rejectComment[docId]?.trim()) {
      notify('Please enter a comment before rejecting.', 'error');
      return;
    }

    try {
      const comment = action === 'REJECTED' ? rejectComment[docId] : (rejectComment[docId] || '');
      await ojtProfessorService.updateDocumentStatus(docId, action, comment, user?.id);
      
      setQueue(prev => prev.map(s => s.studentId !== studentId ? s : {
        ...s,
        docs: s.docs.map(d => d.id !== docId ? d : {
          ...d, status: action, comment: comment,
        }),
      }));
      
      setRejectComment(prev => ({ ...prev, [docId]: '' }));
      notify(`Document ${action === 'APPROVED' ? 'approved' : 'rejected'}.`, action === 'APPROVED' ? 'success' : 'info');
    } catch (err) {
      console.error('Error updating document status:', err);
      notify('Failed to update document status.', 'error');
    }
  };

  const handleMOAChange = async (studentId, internshipId, newStatus) => {
    try {
      await ojtProfessorService.updateMOAStatus(internshipId, newStatus);
      setQueue(prev => prev.map(s => s.studentId !== studentId ? s : { ...s, moaStatus: newStatus }));
      notify(`MOA status updated to "${MOA_LABELS[newStatus]}".`, 'success');
    } catch (err) {
      console.error('Error updating MOA status:', err);
      notify('Failed to update MOA status.', 'error');
    }
  };

  const handleDeploy = async (studentId, internshipId, studentName) => {
    try {
      await ojtProfessorService.approveDeployment(internshipId);
      setQueue(prev => prev.map(s => s.studentId !== studentId ? s : { ...s, deploymentApproved: true }));
      notify(`✅ ${studentName} has been approved for deployment! Stage 2 unlocked.`, 'success');
    } catch (err) {
      console.error('Error approving deployment:', err);
      notify('Failed to approve deployment.', 'error');
    }
  };

  const handleAddRequirement = async (studentId, internshipId) => {
    const docName = document.getElementById(`new-doc-${studentId}`).value;
    if (!docName.trim()) return;

    try {
      const newDoc = await ojtProfessorService.addDocumentRequirement(internshipId, docName);
      setQueue(prev => prev.map(s => s.studentId !== studentId ? s : {
        ...s,
        docs: [...s.docs, {
          id: newDoc.id,
          name: newDoc.document_name,
          status: newDoc.status,
          submittedAt: 'Not Submitted',
          fileUrl: null,
          comment: null
        }]
      }));
      document.getElementById(`new-doc-${studentId}`).value = '';
      notify('New document requirement added.', 'success');
    } catch (err) {
      console.error('Error adding document requirement:', err);
      notify('Failed to add requirement.', 'error');
    }
  };

  const handleDeleteRequirement = (studentId, docId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Document Requirement',
      message: 'Are you sure you want to remove this document requirement?',
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          await ojtProfessorService.deleteDocumentRequirement(docId);
          setQueue(prev => prev.map(s => s.studentId !== studentId ? s : {
            ...s,
            docs: s.docs.filter(d => d.id !== docId)
          }));
          if (activeDoc?.id === docId) setActiveDoc(null);
          notify('Document requirement removed.', 'info');
        } catch (err) {
          console.error('Error deleting document requirement:', err);
          notify('Failed to remove requirement.', 'error');
        }
      }
    });
  };

  const handleSyncChecklist = async (studentId, internshipId) => {
    try {
      setLoading(true);
      const student = queue.find(s => s.studentId === studentId);
      if (!student?.programId) {
        notify('Program ID not found for this student.', 'error');
        return;
      }
      
      await adminService.syncStudentChecklist(internshipId, student.programId);
      await fetchQueue(); 
      notify('Checklist synced with program requirements.', 'success');
    } catch (err) {
      console.error('Error syncing checklist:', err);
      notify('Failed to sync checklist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '24px', 
      position: 'relative', 
      minHeight: 'calc(100vh - 120px)',
      flexWrap: 'wrap'
    }}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      {loading ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '100px 20px',
          width: '100%',
          height: '100%',
          minHeight: '300px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: `3px solid ${theme.colors.primary}20`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin-loader 0.8s linear infinite',
            marginBottom: '16px'
          }} />
          <style>{`
            @keyframes spin-loader {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.textMuted }}>Loading review queue...</span>
        </div>
      ) : (
        <>
      {/* Left Side: Student Queue */}
      <div style={{ 
        flex: activeDoc ? '0 1 400px' : '1 1 500px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        paddingRight: '8px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Pre-Internship Document Review</h1>
            <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Review student documents, update MOA status, and approve deployment.</p>
          </div>
        </div>

        {/* Section Filter Tabs */}
        {availableSections.length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto', 
            paddingBottom: '4px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <div style={{
              display: 'flex',
              backgroundColor: theme.colors.bgSecondary,
              padding: '4px',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm,
              gap: '4px',
            }}>
              {['All', ...availableSections].map((section) => {
                const isActive = selectedSection === section;
                return (
                  <button
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: isActive ? theme.colors.primary : 'transparent',
                      color: isActive ? '#fff' : theme.colors.textMuted,
                      boxShadow: isActive ? '0 4px 12px rgba(30, 64, 175, 0.2)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                        e.currentTarget.style.color = theme.colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.colors.textMuted;
                      }
                    }}
                  >
                    {section}
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : theme.colors.bgAccent,
                      color: isActive ? '#fff' : theme.colors.primary,
                      fontWeight: 800,
                      transition: 'all 0.25s ease'
                    }}>
                      {section === 'All' 
                        ? queue.length 
                        : queue.filter(s => s.sectionName === section).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {queue.length === 0 ? (
          <div style={{ ...commonStyles.dashboardCard, padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No students in the pre-internship queue.</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div style={{ ...commonStyles.dashboardCard, padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No students in {selectedSection} pending review.</p>
          </div>
        ) : filteredQueue.map(student => {
          const isOpen = expanded === student.studentId;
          const pendingCount = student.docs.filter(d => d.status === 'PENDING').length;
          const approvedCount = student.docs.filter(d => d.status === 'APPROVED').length;
          const allApproved = student.docs.length > 0 && approvedCount === student.docs.length;
          const canDeploy = allApproved && student.moaStatus === 'PROCESSED' && !student.deploymentApproved;

          return (
            <div key={student.studentId} style={{ 
              ...commonStyles.dashboardCard, 
              padding: 0, 
              overflow: 'hidden', 
              border: student.deploymentApproved ? '1px solid #bbf7d0' : (isOpen ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`),
              boxShadow: isOpen ? '0 8px 30px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
              transform: isOpen ? 'scale(1.01)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {/* Student header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '20px 24px', 
                cursor: 'pointer', 
                backgroundColor: student.deploymentApproved ? '#f0fdf4' : (isOpen ? theme.colors.bgAccent : '#fff') 
              }}
                onClick={() => setExpanded(isOpen ? null : student.studentId)}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: isOpen ? '#fff' : theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: theme.colors.primary, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <User size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: theme.colors.textMain, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {student.studentName}
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      color: theme.colors.primary, 
                      backgroundColor: theme.colors.bgAccent, 
                      padding: '2px 8px', 
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      {student.sectionName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                    {student.company && student.company !== 'Not Applied' && student.company !== 'N/A' ? (
                      `${student.company}${student.position ? ` • ${student.position}` : ''}`
                    ) : (
                      'Not Applied'
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {student.deploymentApproved ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.8rem', fontWeight: 800 }}>
                      <CheckCircle size={14} /> Deployed
                    </span>
                  ) : pendingCount > 0 ? (
                    <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#fef9c3', color: '#92400e', fontSize: '0.8rem', fontWeight: 800, boxShadow: '0 2px 5px rgba(234, 179, 8, 0.2)' }}>
                      {pendingCount} PENDING
                    </span>
                  ) : null}
                  {isOpen ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${theme.colors.border}`, backgroundColor: '#fafafa' }}>
                  {student.docs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: theme.colors.textMuted }}>
                      <AlertCircle size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p style={{ margin: '0 0 16px 0', fontWeight: 500 }}>No documents in checklist.</p>
                      <button 
                        onClick={() => handleSyncChecklist(student.studentId, student.internshipId)}
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <RefreshCw size={16} /> Sync with Program Checklist
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                      {student.docs.map(doc => {
                        const st = DOC_STATUS[doc.status] || DOC_STATUS.NOT_SUBMITTED;
                        const isSelected = activeDoc?.id === doc.id;
                        return (
                          <div key={doc.id} 
                            onClick={() => setActiveDoc({ ...doc, studentId: student.studentId, studentName: student.studentName })}
                            style={{ 
                              border: isSelected ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`, 
                              borderRadius: '16px', 
                              backgroundColor: isSelected ? '#fff' : '#fff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '16px'
                            }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color }}>
                              <FileText size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: theme.colors.textMain, fontSize: '0.9rem' }}>{doc.name}</div>
                              <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{doc.submittedAt}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {doc.isAdditional && (
                                <span style={{ 
                                  padding: '2px 6px', 
                                  borderRadius: '6px', 
                                  backgroundColor: '#eff6ff', 
                                  color: '#1d4ed8', 
                                  fontSize: '0.65rem', 
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  border: '1px solid #bfdbfe'
                                }}>
                                  Custom
                                </span>
                              )}
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '12px', 
                                backgroundColor: st.bg, 
                                color: st.color, 
                                fontSize: '0.72rem', 
                                fontWeight: 800,
                                textTransform: 'uppercase'
                              }}>
                                {st.label}
                              </span>
                              {doc.isAdditional && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteRequirement(student.studentId, doc.id); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textMuted}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add New Requirement Input */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: `1px dashed ${theme.colors.border}`
                      }}>
                        <input 
                          id={`new-doc-${student.studentId}`}
                          type="text" 
                          placeholder="Add other requirement..." 
                          style={{ ...commonStyles.input, flex: 1, height: '36px', fontSize: '0.85rem' }} 
                          onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement(student.studentId, student.internshipId)}
                        />
                        <button 
                          onClick={() => handleAddRequirement(student.studentId, student.internshipId)}
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, height: '36px', padding: '0 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={14} /> Add
                        </button>
                        <button 
                          onClick={() => handleSyncChecklist(student.studentId, student.internshipId)}
                          title="Sync with Program Checklist"
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, height: '36px', width: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MOA + Deploy section */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <div style={{ ...commonStyles.dashboardCard, padding: '16px', flex: 1, minWidth: '200px', backgroundColor: '#fff' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MOA Status</div>
                      <select value={student.moaStatus} onChange={e => handleMOAChange(student.studentId, student.internshipId, e.target.value)}
                        style={{ ...commonStyles.input, width: '100%', fontWeight: 700, color: MOA_COLORS[student.moaStatus], borderRadius: '10px' }}>
                        {MOA_OPTS.map(o => <option key={o} value={o}>{MOA_LABELS[o]}</option>)}
                      </select>
                    </div>

                    {!student.deploymentApproved && (
                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={() => handleDeploy(student.studentId, student.internshipId, student.studentName)} disabled={!canDeploy}
                          style={{ 
                            ...commonStyles.dashboardBtn, 
                            ...commonStyles.dashboardBtnPrimary, 
                            width: '100%', 
                            height: '52px',
                            borderRadius: '12px',
                            opacity: canDeploy ? 1 : 0.4,
                            boxShadow: canDeploy ? '0 4px 15px rgba(22, 163, 74, 0.3)' : 'none',
                            background: canDeploy ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#ccc' 
                          }}>
                          <Rocket size={18} /> Approve Deployment
                        </button>
                      </div>
                    )}
                    {student.deploymentApproved && (
                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#16a34a', fontWeight: 800, padding: '16px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                        <CheckCircle size={22} /> Student Deployed!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Side: Document Detail / Side Panel */}
      {activeDoc ? (
        <div style={{ 
          flex: '1', 
          backgroundColor: '#fff', 
          borderRadius: '24px', 
          border: `1px solid ${theme.colors.border}`, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ padding: '24px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.colors.primary, textTransform: 'uppercase', marginBottom: '4px' }}>Reviewing Document</div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.textMain }}>{activeDoc.name}</h2>
              <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted, marginTop: '2px' }}>Student: <strong>{activeDoc.studentName}</strong></div>
            </div>
            <button onClick={() => setActiveDoc(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', backgroundColor: theme.colors.bgSecondary }}>
              <XCircle size={24} color={theme.colors.textMuted} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: activeDoc.status === 'NOT_SUBMITTED' ? '#f8fafc' : '#fff', 
              borderRadius: '20px', 
              border: `1px solid ${theme.colors.border}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
            }}>
              {activeDoc.status === 'NOT_SUBMITTED' ? (
                <div style={{
                  height: '300px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '16px'
                }}>
                  <AlertCircle size={64} color="#94a3b8" opacity={0.5} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#475569' }}>No File Uploaded</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Premium Review Toolbar */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 16px', 
                    backgroundColor: theme.colors.bgSecondary,
                    borderBottom: `1px solid ${theme.colors.border}` 
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color={theme.colors.primary} /> File Preview
                    </span>
                    <a href={activeDoc.fileUrl} target="_blank" rel="noopener noreferrer" 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: theme.colors.primary, 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        border: `1px solid ${theme.colors.border}`,
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = theme.colors.primary; }}
                    >
                      <ExternalLink size={12} /> Open in New Tab
                    </a>
                  </div>

                  {/* Native scrollable file iframe */}
                  <div style={{ height: '400px', width: '100%', overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9' }}>
                    <iframe 
                      src={activeDoc.fileUrl} 
                      title="Document Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.colors.textMuted }}>STATUS:</span>
                <span style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: DOC_STATUS[activeDoc.status]?.bg || '#eee', color: DOC_STATUS[activeDoc.status]?.color || '#666', fontSize: '0.75rem', fontWeight: 800 }}>
                  {DOC_STATUS[activeDoc.status]?.label || activeDoc.status}
                </span>
              </div>

              {activeDoc.status === 'PENDING' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <textarea 
                    placeholder="Feedback..." 
                    value={rejectComment[activeDoc.id] || ''} 
                    onChange={e => setRejectComment(p => ({ ...p, [activeDoc.id]: e.target.value }))}
                    style={{ ...commonStyles.input, width: '100%', minHeight: '100px' }} 
                  />
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => { handleDocAction(activeDoc.studentId, activeDoc.id, 'APPROVED'); setActiveDoc(null); }}
                      style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, backgroundColor: '#16a34a', flex: 1 }}>
                      Approve
                    </button>
                    <button onClick={() => { handleDocAction(activeDoc.studentId, activeDoc.id, 'REJECTED'); setActiveDoc(null); }}
                      style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, color: '#dc2626', flex: 1 }}>
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', backgroundColor: theme.colors.bgSecondary, borderRadius: '12px' }}>
                  <strong>Feedback:</strong> {activeDoc.comment || "None"}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bgSecondary, borderRadius: '24px', border: `2px dashed ${theme.colors.border}`, color: theme.colors.textMuted }}>
          <div style={{ textAlign: 'center' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Select a document to review</p>
          </div>
        </div>
      )}
        </>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}
