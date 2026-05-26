import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, Building2, Rocket, ChevronDown, ChevronUp, AlertCircle, User, Eye, MessageSquare, ExternalLink, Plus, Trash2, RefreshCw, Upload, Layers } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { ojtProfessorService } from '../../services/ojtProfessorService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import PageLoader from '../../components/common/PageLoader';
import { jsPDF } from 'jspdf';
import { supabase } from '../../services/supabaseClient';

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
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null); // For the side panel review
  const [rejectComment, setRejectComment] = useState({});
  const [localToast, setLocalToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

  const [moaModal, setMoaModal] = useState({
    isOpen: false,
    student: null,
    details: {
      universityName: 'National University Baliwag',
      adviserName: '',
      studentName: '',
      studentNo: '',
      courseFullName: '',
      companyName: '',
      companyAddress: '',
      supervisorName: '',
      position: '',
      dateString: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  });
  const [generatingMOA, setGeneratingMOA] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  
  // AI Signature Checker State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [pendingMOA, setPendingMOA] = useState(null); // { student, file }
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState('');

  useEffect(() => {
    // Pre-fetch NU Logo and convert to base64 for jsPDF rendering
    const loadLogo = async () => {
      try {
        const response = await fetch('/nu-logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to pre-fetch logo for PDF:', err);
      }
    };
    loadLogo();
  }, []);

  const handleOpenMOAGenerator = (student) => {
    setMoaModal({
      isOpen: true,
      student: student,
      details: {
        universityName: 'National University Baliwag',
        adviserName: user ? `${user.first_name} ${user.last_name}` : '',
        studentName: student.studentName || '',
        studentNo: student.studentNo || '',
        courseFullName: student.courseFullName && student.courseFullName !== 'Not Set' ? student.courseFullName : (student.course || ''),
        companyName: student.company && student.company !== 'Not Applied' ? student.company : '',
        companyAddress: student.companyAddress && student.companyAddress !== 'Not Provided' ? student.companyAddress : '',
        supervisorName: student.supervisorName && student.supervisorName !== 'Not Assigned' ? student.supervisorName : '',
        position: student.position && student.position !== 'Not Assigned' ? student.position : '',
        dateString: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }
    });
  };

  const generatePDFInstance = (details) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    // 1. Draw CCIT Premium Letterhead
    // Top-right Document Code
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('CCIT-FO-015', 195, 18, { align: 'right' });

    // Draw Logo on the header
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 20, 7, 55.8, 18);
      } catch (e) {
        console.error('Error drawing image on PDF:', e);
      }
    }

    // Gold separator line
    doc.setFillColor(253, 200, 47); // Gold
    doc.rect(20, 28, 175, 1.2, 'F');

    // Document Title
    doc.setFont('Times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('MEMORANDUM OF AGREEMENT', 107.95, 42, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text('STUDENT INTERNSHIP PROGRAM', 107.95, 48, { align: 'center' });

    doc.setFont('Times', 'normal');
    doc.setFontSize(10.5);

    const introText = `KNOWN ALL MEN BY THESE PRESENTS:\n\n` +
      `This Memorandum of Agreement is made and entered into this ${details.dateString || '_______'}, by and between:\n\n` +
      `The FIRST PARTY: ${details.universityName || '_______'}, an educational institution, represented by its OJT Adviser / Coordinator, ${details.adviserName || '_______'};\n\n` +
      `The SECOND PARTY: ${details.companyName || 'Host Training Establishment'}, a company organized under laws, with office address at ${details.companyAddress || 'N/A'}, represented by its Supervisor / Representative, ${details.supervisorName || 'N/A'};\n\n` +
      `and\n\n` +
      `The STUDENT INTERN: ${details.studentName || '_______'}, a student currently enrolled in ${details.courseFullName || '_______'} (Student ID: ${details.studentNo || 'N/A'}).\n\n` +
      `WITNESSETH THAT:\n\n` +
      `WHEREAS, the FIRST PARTY has established a Student Internship Program designed to provide students with practical, hands-on training to supplement their academic curriculum;\n\n` +
      `WHEREAS, the SECOND PARTY is willing to admit the STUDENT INTERN into their establishment as a ${details.position || 'Intern'} to undergo training under supervised conditions;\n\n` +
      `NOW, THEREFORE, for and in consideration of the foregoing premises, the parties hereto agree as follows:\n\n` +
      `1. DURATION: The internship training shall commence on the date of deployment and shall continue until the required internship hours are fully rendered.\n` +
      `2. ROLES AND RESPONSIBILITIES: The FIRST PARTY shall provide academic direction, evaluate the student's reports, and assign grades. The SECOND PARTY shall provide safe working conditions, relevant tasks matching the student's program, and designated supervisor guidance. The STUDENT INTERN shall adhere to all company regulations, maintain absolute confidentiality, and complete the tasks assigned with due diligence.\n` +
      `3. COMPLIANCE: The student and parties shall follow all guidelines of the Commission on Higher Education (CHED) regarding student internship programs.\n\n` +
      `IN WITNESS WHEREOF, the parties hereunto set their hands on this agreement.`;

    const splitText = doc.splitTextToSize(introText, 175);
    doc.text(splitText, 20, 58);

    const ySignatures = 212;
    doc.setFont('Times', 'bold');
    doc.text('FIRST PARTY (University):', 20, ySignatures);
    doc.text('SECOND PARTY (Company):', 120, ySignatures);

    doc.setLineWidth(0.25);
    doc.line(20, ySignatures + 14, 80, ySignatures + 14);
    doc.line(120, ySignatures + 14, 180, ySignatures + 14);

    doc.setFont('Times', 'normal');
    doc.text(details.adviserName || '_______', 20, ySignatures + 18);
    doc.setFontSize(8.5);
    doc.text('OJT Adviser / Coordinator', 20, ySignatures + 22);

    doc.setFont('Times', 'normal');
    doc.setFontSize(10.5);
    doc.text(details.supervisorName || 'Representative', 120, ySignatures + 18);
    doc.setFontSize(8.5);
    doc.text('Host Supervisor / Representative', 120, ySignatures + 22);

    doc.setFont('Times', 'bold');
    doc.setFontSize(10.5);
    doc.text('STUDENT INTERN:', 70, ySignatures + 32);
    doc.line(70, ySignatures + 44, 140, ySignatures + 44);
    doc.setFont('Times', 'normal');
    doc.text(details.studentName || '_______', 70, ySignatures + 48);
    doc.setFontSize(8.5);
    doc.text('Student Intern', 70, ySignatures + 52);

    // 2. Draw CCIT Premium Footer
    doc.setFillColor(253, 200, 47); // Gold
    doc.rect(20, 258, 175, 1.2, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('SM Baliwag Complex, Dona Remedios Trinidad Highway, Brgy. Pagala, Baliuag, Bulacan.', 20, 263);
    doc.text('Tel: +639190814635 | Website: www.national-u.edu.ph/nu-baliwag', 20, 266);

    doc.setFont('Georgia', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(29, 45, 91);
    doc.text('Education that works.', 195, 264, { align: 'right' });

    return doc;
  };

  const handleDownloadMOAPDF = () => {
    const { student, details } = moaModal;
    if (!student) return;
    try {
      const doc = generatePDFInstance(details);
      doc.save(`MOA_${details.studentName.replace(/\s+/g, '_')}.pdf`);
      notify('MOA exported as PDF successfully!', 'success');
    } catch (err) {
      console.error('Error downloading MOA:', err);
      notify('Failed to export PDF locally.', 'error');
    }
  };



  const [deploymentFilter, setDeploymentFilter] = useState('ALL'); // 'ALL', 'PENDING', 'DEPLOYED'

  const filteredQueue = queue.filter(student => {
    // Deployment Filter
    if (deploymentFilter === 'PENDING' && student.deploymentApproved) {
      return false;
    }
    if (deploymentFilter === 'DEPLOYED' && !student.deploymentApproved) {
      return false;
    }
    return true;
  });

  // Group students by section
  const assignedSections = user?.professor_sections?.map(ps => ({
    id: ps.section_id || ps.program_sections?.id,
    name: ps.program_sections?.name || 'Assigned Section'
  })).filter(s => s.id) || [];

  const sectionsList = [];
  const sectionsMap = {};

  // First, initialize sectionsMap with all assigned sections
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

  // Then group the students in the filteredQueue
  filteredQueue.forEach(student => {
    const sId = student.sectionId || 'unassigned';
    const sName = student.sectionName || 'Not Assigned';

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
    sec.students.sort((a, b) => a.studentName.localeCompare(b.studentName));
  });

  const sectionStyles = {
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

  const notify = useCallback((msg, type) => {
    if (showOutletToast) showOutletToast(msg, type);
    else if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  }, [showOutletToast, showToast]);

  const fetchQueue = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await ojtProfessorService.getDocumentQueue();
      setQueue(data);
    } catch (err) {
      console.error('Error fetching document queue:', err);
      notify('Failed to load document queue.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

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

  // Direct MOA upload method (no AI signature check)
  const handleMOAUpload = async (student, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      notify('Please select a valid PDF document.', 'error');
      return;
    }

    try {
      notify(`Uploading Signed MOA for ${student.studentName}...`, 'info');
      const fileName = `moa-${student.studentId}-${Date.now()}.pdf`;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];

          const response = await fetch('/api/professor/upload-signed-moa', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              internshipId: student.internshipId,
              fileName,
              fileBase64: base64Data,
              reviewerId: user?.id
            })
          });

          const resData = await response.json();
          if (!response.ok) {
            throw new Error(resData.error || 'Server upload failed');
          }

          // Refresh document queue silently to update the view without flickering
          await fetchQueue(true);
          notify(`✅ Signed MOA successfully uploaded and processed!`, 'success');
        } catch (uploadErr) {
          console.error('Upload request error:', uploadErr);
          notify('Failed to upload signed MOA: ' + uploadErr.message, 'error');
        }
      };
      reader.onerror = (readErr) => {
        console.error('FileReader error:', readErr);
        notify('Failed to read signed MOA file.', 'error');
      };
    } catch (err) {
      console.error('Error initiating upload:', err);
      notify('Failed to upload signed MOA.', 'error');
    }
  };

  // Unsubmit MOA trigger
  const handleUnsubmitMOA = (student) => {
    setConfirmModal({
      isOpen: true,
      title: 'Unsubmit Student MOA',
      message: `Are you sure you want to unsubmit the MOA for ${student.studentName}? This will reset their MOA status to PENDING and clear their pre-internship checklist document record, allowing you to upload a new signed copy.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          notify(`Resetting MOA status for ${student.studentName}...`, 'info');
          
          const response = await fetch('/api/professor/unsubmit-moa', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              internshipId: student.internshipId
            })
          });

          const resData = await response.json();
          if (!response.ok) {
            throw new Error(resData.error || 'Unsubmit failed');
          }

          await fetchQueue(true);
          notify(`✅ MOA unsubmitted successfully! The status has been reset.`, 'success');
        } catch (err) {
          console.error('Error unsubmitting MOA:', err);
          notify('Failed to unsubmit MOA: ' + err.message, 'error');
        }
      }
    });
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
        <PageLoader message="Loading review queue..." />
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

        {/* Deployment Status Filter */}
        <div style={{
          display: 'flex',
          backgroundColor: theme.colors.bgSecondary,
          padding: '4px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
          gap: '4px',
          alignSelf: 'flex-start'
        }}>
          {[
            { id: 'ALL', label: 'All Students', count: queue.length },
            { id: 'PENDING', label: 'Pending Deployment', count: queue.filter(s => !s.deploymentApproved).length },
            { id: 'DEPLOYED', label: 'Deployed', count: queue.filter(s => s.deploymentApproved).length }
          ].map((opt) => {
            const isActive = deploymentFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setDeploymentFilter(opt.id)}
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
                {opt.label}
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : theme.colors.bgAccent,
                  color: isActive ? '#fff' : theme.colors.primary,
                  fontWeight: 800,
                }}>
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredQueue.length === 0 ? (
          <div style={{ ...commonStyles.dashboardCard, padding: '60px', textAlign: 'center', color: theme.colors.textMuted }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No students pending review.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sectionsList.map(sec => {
              const isSectionOpen = expandedSectionId === sec.id;
              const matchCount = sec.students.length;

              // Hide empty sections if filtering is active (deploymentFilter is not ALL)
              if (deploymentFilter !== 'ALL' && matchCount === 0) {
                return null;
              }

              return (
                <div key={sec.id} style={sectionStyles.sectionCard}>
                  {/* Section Header */}
                  <div 
                    style={sectionStyles.sectionHeader(isSectionOpen)}
                    onClick={() => {
                      setExpandedSectionId(isSectionOpen ? null : sec.id);
                      setExpanded(null);
                    }}
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
                      <span style={sectionStyles.countBadge}>{matchCount} Students</span>
                      {isSectionOpen ? <ChevronUp size={18} color={theme.colors.textMuted} /> : <ChevronDown size={18} color={theme.colors.textMuted} />}
                    </div>
                  </div>

                  {/* Section Content: Students Queue Accordion */}
                  {isSectionOpen && (
                    <div style={{ padding: '16px', backgroundColor: '#fcfcfd', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {matchCount === 0 ? (
                        <div style={{ padding: '12px', textAlign: 'center', color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                          No students in this section.
                        </div>
                      ) : (
                        sec.students.map(student => {
                          const isOpen = expanded === student.studentId;
                          const pendingCount = student.docs.filter(d => d.status === 'PENDING').length;
                          const approvedCount = student.docs.filter(d => d.status === 'APPROVED').length;
                          const allApproved = student.docs.length > 0 && approvedCount === student.docs.length;
                          const hasCompletedPreInternship = student.docs.length > 0 && student.docs.filter(d => !d.name.toLowerCase().includes('moa') && !d.name.toLowerCase().includes('memorandum of agreement')).every(d => d.status === 'APPROVED');
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
                                    {student.deploymentApproved && (
                                      <span style={{ 
                                        fontSize: '0.72rem', 
                                        fontWeight: 800, 
                                        color: '#16a34a', 
                                        backgroundColor: '#dcfce7', 
                                        padding: '2px 8px', 
                                        borderRadius: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px',
                                        border: '1px solid #bbf7d0'
                                      }}>
                                        Deployed
                                      </span>
                                    )}
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
                                    <div style={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '12px', 
                                      marginTop: '20px',
                                      maxHeight: '335px',
                                      overflowY: 'auto',
                                      paddingRight: '6px'
                                    }}>
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
                                    <div style={{ ...commonStyles.dashboardCard, padding: '16px', flex: 1, minWidth: '200px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MOA Status</div>
                                        {hasCompletedPreInternship ? (
                                          <button
                                            onClick={() => handleOpenMOAGenerator(student)}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              color: theme.colors.primary,
                                              fontSize: '0.75rem',
                                              fontWeight: 800,
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              padding: 0
                                            }}
                                          >
                                            <FileText size={12} /> Generate MOA
                                          </button>
                                        ) : (
                                          <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, fontWeight: 700 }} title="All pre-internship checklist items must be approved first.">
                                            Checklist Incomplete
                                          </span>
                                        )}
                                      </div>
                                      {student.moaStatus === 'PROCESSED' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                                            <CheckCircle size={16} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>SIGNED MOA UPLOADED</span>
                                          </div>
                                          {student.docs.find(d => d.name.toLowerCase().includes('moa') || d.name.toLowerCase().includes('memorandum of agreement'))?.fileUrl && (
                                            <a 
                                              href={student.docs.find(d => d.name.toLowerCase().includes('moa') || d.name.toLowerCase().includes('memorandum of agreement')).fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                ...commonStyles.dashboardBtn,
                                                ...commonStyles.dashboardBtnSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '8px 12px',
                                                fontSize: '0.78rem',
                                                textDecoration: 'none',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff',
                                                color: theme.colors.textMain,
                                                fontWeight: 700
                                              }}
                                            >
                                              <Eye size={14} /> View Uploaded MOA
                                            </a>
                                          )}
                                          <button
                                            onClick={() => handleUnsubmitMOA(student)}
                                            style={{
                                              ...commonStyles.dashboardBtn,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '6px',
                                              padding: '8px 12px',
                                              fontSize: '0.78rem',
                                              border: '1px solid #fca5a5',
                                              borderRadius: '10px',
                                              backgroundColor: '#fee2e2',
                                              color: '#b91c1c',
                                              fontWeight: 700,
                                              cursor: 'pointer',
                                              transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#fecaca';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = '#fee2e2';
                                            }}
                                          >
                                            <RefreshCw size={14} /> Unsubmit MOA
                                          </button>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                                          <label 
                                            style={{
                                              ...commonStyles.dashboardBtn,
                                              ...commonStyles.dashboardBtnPrimary,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '8px',
                                              cursor: 'pointer',
                                              fontSize: '0.78rem',
                                              fontWeight: 800,
                                              padding: '10px 14px',
                                              borderRadius: '12px',
                                              backgroundColor: theme.colors.primary,
                                              color: '#fff',
                                              boxShadow: '0 2px 8px rgba(29, 45, 91, 0.25)',
                                              transition: 'all 0.2s ease',
                                              margin: 0
                                            }}
                                          >
                                            <Upload size={14} /> Upload Signed MOA (PDF)
                                            <input 
                                              type="file" 
                                              accept=".pdf"
                                              onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleMOAUpload(student, file);
                                              }}
                                              style={{ display: 'none' }}
                                            />
                                          </label>
                                          <span style={{ fontSize: '0.68rem', color: theme.colors.textMuted, textAlign: 'center', fontStyle: 'italic' }}>
                                            Upload signed copy to automatically update status to Processed.
                                          </span>
                                        </div>
                                      )}
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
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}  </div>

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

      {moaModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '1200px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: `1px solid ${theme.colors.border}`,
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.colors.bgSecondary
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: theme.colors.textMain }}>
                  Generate Memorandum of Agreement (MOA)
                </h2>
                <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                  Customize student details, download the PDF agreement, and attach it to the student.
                </p>
              </div>
              <button 
                onClick={() => setMoaModal(prev => ({ ...prev, isOpen: false }))} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadows.sm }}
              >
                <XCircle size={24} color={theme.colors.textMuted} />
              </button>
            </div>

            {/* Modal Content - Dual Panel */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
              {/* Left Panel - Forms (Scrollable) */}
              <div style={{
                flex: '1 1 450px',
                height: '100%',
                padding: '24px',
                overflowY: 'auto',
                borderRight: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.bgSecondary,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800, color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contract Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* University Representative Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>FIRST PARTY (UNIVERSITY NAME)</label>
                    <input 
                      type="text" 
                      value={moaModal.details.universityName} 
                      onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, universityName: e.target.value } }))}
                      style={commonStyles.input}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>OJT ADVISER / REPRESENTATIVE NAME</label>
                    <input 
                      type="text" 
                      value={moaModal.details.adviserName} 
                      onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, adviserName: e.target.value } }))}
                      style={commonStyles.input}
                    />
                  </div>

                  {/* Student Details */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>STUDENT NAME</label>
                      <input 
                        type="text" 
                        value={moaModal.details.studentName} 
                        onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, studentName: e.target.value } }))}
                        style={commonStyles.input}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>STUDENT ID</label>
                      <input 
                        type="text" 
                        value={moaModal.details.studentNo} 
                        onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, studentNo: e.target.value } }))}
                        style={commonStyles.input}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>COURSE / PROGRAM FULL NAME</label>
                    <input 
                      type="text" 
                      value={moaModal.details.courseFullName} 
                      onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, courseFullName: e.target.value } }))}
                      style={commonStyles.input}
                    />
                  </div>

                  {/* Company Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>SECOND PARTY (COMPANY / ESTABLISHMENT NAME)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Google Philippines Inc."
                      value={moaModal.details.companyName} 
                      onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, companyName: e.target.value } }))}
                      style={commonStyles.input}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>COMPANY ADDRESS</label>
                    <input 
                      type="text" 
                      placeholder="e.g. BGC, Taguig City, Metro Manila"
                      value={moaModal.details.companyAddress} 
                      onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, companyAddress: e.target.value } }))}
                      style={commonStyles.input}
                    />
                  </div>

                  {/* Supervisor & Placement Details */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>SUPERVISOR NAME</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Smith"
                        value={moaModal.details.supervisorName} 
                        onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, supervisorName: e.target.value } }))}
                        style={commonStyles.input}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>INTERN POSITION</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Software Engineer Intern"
                        value={moaModal.details.position} 
                        onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, position: e.target.value } }))}
                        style={commonStyles.input}
                      />
                    </div>
                  </div>

                  {/* Agreement Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted }}>DATE OF AGREEMENT</label>
                    <input 
                      type="text" 
                      value={moaModal.details.dateString} 
                      onChange={e => setMoaModal(prev => ({ ...prev, details: { ...prev.details, dateString: e.target.value } }))}
                      style={commonStyles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Right Panel - Live Preview (Scrollable) */}
              <div style={{
                flex: '1.2 1 500px',
                height: '100%',
                padding: '24px',
                overflowY: 'auto',
                backgroundColor: '#cbd5e1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '750px',
                  minHeight: '842px', // standard ratio for A4
                  backgroundColor: '#fff',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  borderRadius: '4px',
                  padding: '40px 35px',
                  fontFamily: '"Times New Roman", Times, serif',
                  color: '#111',
                  lineHeight: '1.35',
                  fontSize: '0.82rem',
                  textAlign: 'justify',
                  border: '1px solid #94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    {/* CCIT Official Letterhead - Logo Only */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5px' }}>
                      <img src="/nu-logo.png" alt="NU Logo" style={{ height: '70px', width: '217px', display: 'block', objectFit: 'contain' }} />
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '9px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
                        CCIT-FO-015
                      </div>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#FDC82F', marginTop: '4px', marginBottom: '20px' }} />

                    {/* Preview Document Head */}
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '2px', letterSpacing: '0.5px' }}>
                      MEMORANDUM OF AGREEMENT
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '14px', color: '#475569' }}>
                      STUDENT INTERNSHIP PROGRAM
                    </div>
                    <div style={{ borderTop: '1px solid #000', margin: '0 0 16px 0' }} />

                    <p style={{ textIndent: '30px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                      KNOWN ALL MEN BY THESE PRESENTS:
                    </p>
                    <p style={{ textIndent: '30px', margin: '0 0 12px 0' }}>
                      This Memorandum of Agreement is made and entered into this <span style={{ borderBottom: '1px solid #111', padding: '0 4px', fontWeight: 'bold', color: theme.colors.primary }}>{moaModal.details.dateString || '_______'}</span>, by and between:
                    </p>
                    <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                      The <strong>FIRST PARTY</strong>: <strong style={{ color: theme.colors.primary }}>{moaModal.details.universityName || '_______'}</strong>, an educational institution, represented by its OJT Adviser / Coordinator, <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{moaModal.details.adviserName || '_______'}</span>;
                    </p>
                    <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                      The <strong>SECOND PARTY</strong>: <strong style={{ color: theme.colors.primary }}>{moaModal.details.companyName || '_______'}</strong>, a company organized under laws, with office address at <span style={{ fontStyle: 'italic' }}>{moaModal.details.companyAddress || '_______'}</span>, represented by its Supervisor / Representative, <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{moaModal.details.supervisorName || '_______'}</span>;
                    </p>
                    <p style={{ textAlign: 'center', margin: '6px 0', fontWeight: 'bold', fontSize: '0.75rem' }}>AND</p>
                    <p style={{ margin: '0 0 16px 0', textIndent: '30px' }}>
                      The <strong>STUDENT INTERN</strong>: <strong style={{ color: theme.colors.primary }}>{moaModal.details.studentName || '_______'}</strong>, a student currently enrolled in <span style={{ fontWeight: 'bold' }}>{moaModal.details.courseFullName || '_______'}</span> (Student ID: {moaModal.details.studentNo || 'N/A'}).
                    </p>

                    <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>WITNESSETH THAT:</p>
                    <p style={{ textIndent: '30px', margin: '0 0 8px 0' }}>
                      WHEREAS, the FIRST PARTY has established a Student Internship Program designed to provide students with practical, hands-on training to supplement their academic curriculum;
                    </p>
                    <p style={{ textIndent: '30px', margin: '0 0 8px 0' }}>
                      WHEREAS, the SECOND PARTY is willing to admit the STUDENT INTERN into their establishment as a <span style={{ fontWeight: 'bold', borderBottom: '1px solid #111' }}>{moaModal.details.position || '_______'}</span> to undergo training under supervised conditions;
                    </p>
                    <p style={{ textIndent: '30px', margin: '0 0 12px 0' }}>
                      NOW, THEREFORE, for and in consideration of the foregoing premises, the parties hereto agree as follows:
                    </p>

                    <ol style={{ paddingLeft: '20px', margin: '0 0 16px 0' }}>
                      <li style={{ marginBottom: '6px' }}>
                        <strong>DURATION:</strong> The internship training shall commence on the date of deployment and shall continue until the required internship hours are fully rendered.
                      </li>
                      <li style={{ marginBottom: '6px' }}>
                        <strong>ROLES AND RESPONSIBILITIES:</strong> The FIRST PARTY shall provide academic direction, evaluate the student's reports, and assign grades. The SECOND PARTY shall provide safe working conditions, relevant tasks matching the student's program, and designated supervisor guidance. The STUDENT INTERN shall adhere to all company regulations, maintain absolute confidentiality, and complete the tasks assigned with due diligence.
                      </li>
                      <li style={{ marginBottom: '6px' }}>
                        <strong>COMPLIANCE:</strong> The student and parties shall follow all guidelines of the Commission on Higher Education (CHED) regarding student internship programs.
                      </li>
                    </ol>

                    <p style={{ textIndent: '30px', margin: '0 0 20px 0' }}>
                      IN WITNESS WHEREOF, the parties hereunto set their hands on this agreement.
                    </p>

                    {/* Signatures Grid */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '28px', fontSize: '0.78rem' }}>FIRST PARTY (University):</div>
                        <div style={{ borderTop: '1px solid #111', width: '100%', maxWidth: '210px', paddingTop: '4px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{moaModal.details.adviserName || '_______'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#555' }}>OJT Adviser / Coordinator</div>
                        </div>
                      </div>
                      <div style={{ flex: '1 1 200px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '28px', fontSize: '0.78rem' }}>SECOND PARTY (Company):</div>
                        <div style={{ borderTop: '1px solid #111', width: '100%', maxWidth: '210px', paddingTop: '4px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{moaModal.details.supervisorName || '_______'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#555' }}>Host Supervisor / Representative</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      <div style={{ textAlign: 'center', width: '100%', maxWidth: '240px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '28px', fontSize: '0.78rem' }}>STUDENT INTERN:</div>
                        <div style={{ borderTop: '1px solid #111', width: '100%', paddingTop: '4px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{moaModal.details.studentName || '_______'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#555' }}>Student Intern</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CCIT ISO Badges & Compliance Footer */}
                  <div style={{ borderTop: '4px solid #FDC82F', paddingTop: '12px', marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <svg width="35" height="35" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                        <circle cx="50" cy="50" r="45" stroke="#1D2D5B" strokeWidth="4" fill="#FFFFFF"/>
                        <path d="M30 45 L45 60 L70 35" stroke="#FDC82F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="50" y="82" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="#1D2D5B" textAnchor="middle">ISO 9001</text>
                      </svg>
                      <svg width="35" height="35" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                        <circle cx="50" cy="50" r="45" stroke="#1D2D5B" strokeWidth="4" fill="#FFFFFF"/>
                        <text x="50" y="42" fontFamily="Arial" fontSize="18" fontWeight="900" fill="#1D2D5B" textAnchor="middle">★★★</text>
                        <text x="50" y="65" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="#1D2D5B" textAnchor="middle">NU STARS</text>
                      </svg>
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '7.5px', lineHeight: '1.2', color: '#475569' }}>
                      SM Baliwag Complex, Doña Remedios Trinidad Highway, Brgy. Pagala, Baliuag, Bulacan.<br />
                      Tel: +639190814635 | Website: www.national-u.edu.ph/nu-baliwag
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '12px', color: '#1D2D5B', fontWeight: 'bold' }}>
                      Education that works.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.bgSecondary,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={() => setMoaModal(prev => ({ ...prev, isOpen: false }))} 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
                disabled={generatingMOA}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleDownloadMOAPDF}
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${theme.colors.primary}`, color: theme.colors.primary }}
                disabled={generatingMOA}
              >
                <Eye size={16} /> Download Local PDF
              </button>


            </div>
          </div>
        </div>
      )}
    </div>
  );
}
