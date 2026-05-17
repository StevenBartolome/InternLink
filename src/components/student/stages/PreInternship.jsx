// src/components/student/stages/PreInternship.jsx
import React, { useState } from 'react';
import { Building2, MapPin, Briefcase, Upload, CheckCircle, XCircle, Clock, AlertCircle, FileText, ChevronDown, ChevronUp, Send, Eye, RotateCcw, Download, Wand2, Printer, Calendar } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { commonStyles } from '../../../styles/commonStyles';
import Toast from '../../common/Toast';
import ConfirmModal from '../../common/ConfirmModal';
import { useAuth } from '../../../context/AuthContext';
import { studentService } from '../../../services/studentService';
import { adminService } from '../../../services/adminService';

const STATUS_CONFIG = {
  APPROVED:      { label: 'Approved',      color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  PENDING:       { label: 'Pending',       color: '#d97706', bg: '#fef9c3', icon: <Clock size={14} /> },
  REJECTED:      { label: 'Rejected',      color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> },
  NOT_SUBMITTED: { label: 'Not Submitted', color: '#94a3b8', bg: '#f1f5f9', icon: <AlertCircle size={14} /> },
};

const MOA_COLORS = { NOT_STARTED: '#94a3b8', IN_PROGRESS: '#d97706', PROCESSED: '#16a34a' };
const MOA_LABELS = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', PROCESSED: 'Processed' };

export default function PreInternship({ onDeploy }) {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const [generatorModal, setGeneratorModal] = useState({
    isOpen: false,
    type: '', // 'consent' | 'recommendation'
    formData: {
      studentName: '',
      program: '',
      hours: '',
      companyName: '',
      companyAddress: '',
      position: '',
      parentName: '',
      parentContact: '',
      startDate: '',
      endDate: '',
      letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      recipientName: '',
      recipientTitle: '',
      adviserName: 'Prof. Steven Bartolome'
    }
  });
  const [docs, setDocs] = useState([]); // Real docs will be fetched from DB
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    companyName: user?.company_name || '',
    companyAddress: user?.company_address || '',
    position: user?.position || '',
  });
  const [companySaved, setCompanySaved] = useState(!!user?.company_name);
  const moaStatus = user?.moa_status || 'NOT_STARTED';
  const deploymentApproved = user?.is_deployed || false;

  React.useEffect(() => {
    if (user?.internship_id) {
      fetchDocs();
    }
  }, [user]);

  const fetchDocs = async () => {
    const hasExistingDocs = docs.length > 0;
    try {
      if (!hasExistingDocs) {
        setLoading(true);
      }
      
      // 1. Fetch current documents first for INSTANT render!
      const data = await studentService.getPreInternshipDocuments(user?.internship_id);
      setDocs(data);
      
      // 2. Hide loading spinner immediately so the UI is active and responsive
      setLoading(false);

      // 3. Sync in the background silently to fetch new templates without blocking the UI
      const programId = user?.program_id || user?.profile?.program_id;
      if (user?.internship_id && programId) {
        await adminService.syncStudentChecklist(user.internship_id, programId);
        
        // Quietly fetch again in case new templates were synced
        const syncedData = await studentService.getPreInternshipDocuments(user.internship_id);
        
        // Only update state if count or content changed to prevent unnecessary re-renders
        if (syncedData.length !== data.length || JSON.stringify(syncedData) !== JSON.stringify(data)) {
          setDocs(syncedData);
        }
      }
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docId, file) => {
    if (!file) return;
    try {
      setToast({ message: 'Uploading document...', type: 'info' });
      const doc = docs.find(d => d.id === docId);
      await studentService.uploadDocument(docId, file, doc?.isAdditional);
      await fetchDocs();
      setToast({ message: 'Document uploaded — pending review.', type: 'success' });
    } catch (err) {
      console.error('Upload failed:', err);
      setToast({ message: 'Upload failed. Please try again.', type: 'error' });
    }
  };

  const handleUndoSubmission = (docId, isAdditional) => {
    setConfirmModal({
      isOpen: true,
      title: 'Recall Submission',
      message: 'Are you sure you want to undo this submission? This will recall your file.',
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          setToast({ message: 'Recalling document...', type: 'info' });
          await studentService.undoSubmission(docId, isAdditional);
          await fetchDocs();
          setToast({ message: 'Document submission recalled.', type: 'success' });
        } catch (err) {
          console.error('Undo failed:', err);
          setToast({ message: 'Failed to undo submission.', type: 'error' });
        }
      }
    });
  };

  const handleCompanySave = (e) => {
    e.preventDefault();
    setCompanySaved(true);
    setToast({ message: 'Company information saved!', type: 'success' });
  };

  const openGenerator = (type) => {
    setGeneratorModal({
      isOpen: true,
      type: type,
      formData: {
        studentName: (user?.first_name ? `${user.first_name} ${user.last_name}` : '') || user?.name || '',
        program: user?.program_code || user?.profile?.program?.code || 'Information Technology',
        hours: user?.required_hours || 486,
        companyName: companyForm.companyName || '',
        companyAddress: companyForm.companyAddress || '',
        position: companyForm.position || '',
        parentName: '',
        parentContact: '',
        startDate: '',
        endDate: '',
        letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        recipientName: '',
        recipientTitle: '',
        adviserName: 'Prof. Steven Bartolome'
      }
    });
  };

  const handleGeneratePrintWindow = (e) => {
    e.preventDefault();
    const data = generatorModal.formData;
    
    // Validate required fields based on document type
    if (generatorModal.type === 'consent') {
      if (!data.parentName || !data.parentContact || !data.startDate || !data.endDate) {
        setToast({ message: 'Please fill in all parent consent details.', type: 'error' });
        return;
      }
    } else {
      if (!data.recipientName || !data.recipientTitle || !data.letterDate) {
        setToast({ message: 'Please fill in all recommendation letter details.', type: 'error' });
        return;
      }
    }

    setGeneratorModal(prev => ({ ...prev, isOpen: false }));
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setToast({ message: 'Pop-up blocked! Please allow pop-ups to view the print template.', type: 'error' });
      return;
    }

    let htmlContent = '';

    if (generatorModal.type === 'consent') {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>CCIT-FO-014 Parent Consent Form - ${data.studentName}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      color: #0f172a;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000000;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 18px;
      margin: 0;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .header h2 {
      font-size: 14px;
      margin: 5px 0 0 0;
      color: #475569;
    }
    .doc-num {
      text-align: right;
      font-size: 11px;
      font-weight: bold;
    }
    .title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 30px 0;
      text-decoration: underline;
    }
    .content {
      font-size: 14px;
      text-align: justify;
    }
    .signatures {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .sig-block {
      text-align: center;
      width: 45%;
    }
    .sig-line {
      margin-top: 50px;
      border-top: 1px solid #000;
      padding-top: 5px;
      font-weight: bold;
    }
    .print-header {
      background-color: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;
      font-family: Arial, sans-serif;
      border: 1px solid #e2e8f0;
    }
    .print-btn {
      background-color: #1d4ed8;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 8px;
    }
    @media print {
      .print-header {
        display: none;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <strong>InternLink Document Preview (Parental Consent Form)</strong><br/>
    Fill out parent details below. Click Print to save as PDF or print on A4 paper.<br/>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="doc-num">CCIT-FO-014</div>
  <div class="header">
    <h1>NATIONAL UNIVERSITY BALIWAG</h1>
    <h2>School of Computing and Information Technology</h2>
  </div>
  
  <div class="title">LETTER OF PARENT / GUARDIAN CONSENT</div>
  
  <div class="content">
    <p>Date: <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
    
    <p>To the OJT Program Coordinator,<br/>
    School of Computing and Information Technology<br/>
    National University Baliwag</p>
    
    <p>I, <strong>${data.parentName}</strong>, hereby declare that I am the parent / legal guardian of <strong>${data.studentName}</strong>, who is currently enrolled as a student in the <strong>${data.program}</strong> program at National University Baliwag.</p>
    
    <p>I give my full consent and permission for him/her to undergo the official Internship / On-the-Job Training program consisting of <strong>${data.hours} hours</strong> at <strong>${data.companyName}</strong>, located at <strong>${data.companyAddress}</strong>, starting from <strong>${new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> to <strong>${new Date(data.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
    
    <p>I understand that while undergoing this training, he/she will be under the direct supervision of the Host Training Establishment (HTE) personnel and must abide by the rules and regulations set forth by both National University Baliwag and the hosting company. I acknowledge that National University Baliwag has taken necessary safeguards for this activity, and I will not hold the institution liable for incidents beyond its reasonable control.</p>
  </div>
  
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">${data.parentName}</div>
      <div>Parent / Guardian Signature</div>
      <div style="font-size: 12px; color: #475569; margin-top: 4px;">Contact No: ${data.parentContact}</div>
    </div>
    
    <div class="sig-block">
      <div class="sig-line">${data.studentName}</div>
      <div>Student Signature</div>
    </div>
  </div>
  
  <div class="signatures" style="margin-top: 40px;">
    <div class="sig-block" style="width: 100%;">
      <div class="sig-line" style="width: 50%; margin: 50px auto 0 auto;">${data.adviserName}</div>
      <div>OJT Adviser</div>
    </div>
  </div>
</body>
</html>
      `;
    } else {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>CCIT-FO-013 Recommendation Letter - ${data.studentName}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #000;
      padding: 60px 50px;
      line-height: 1.5;
      font-size: 14px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 20px;
      margin: 0;
      font-weight: bold;
    }
    .header h2 {
      font-size: 14px;
      margin: 5px 0 0 0;
      font-style: italic;
    }
    .doc-num {
      text-align: right;
      font-size: 11px;
      font-weight: bold;
    }
    .recipient {
      margin-top: 30px;
      margin-bottom: 30px;
    }
    .subject {
      font-weight: bold;
      text-transform: uppercase;
      margin: 25px 0;
    }
    .content {
      text-align: justify;
    }
    .signatures {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .sig-block {
      width: 45%;
    }
    .sig-line {
      margin-top: 60px;
      border-top: 1px solid #000;
      padding-top: 5px;
      font-weight: bold;
    }
    .print-header {
      background-color: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;
      font-family: Arial, sans-serif;
      border: 1px solid #e2e8f0;
    }
    .print-btn {
      background-color: #1d4ed8;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 8px;
    }
    @media print {
      .print-header {
        display: none;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <strong>InternLink Document Preview (Recommendation Letter)</strong><br/>
    Verify recipient and student info. Click Print to save as PDF or print on letterhead.<br/>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="doc-num">CCIT-FO-013</div>
  <div class="header">
    <h1>NATIONAL UNIVERSITY BALIWAG</h1>
    <h2 style="font-family: Arial, sans-serif;">School of Computing and Information Technology</h2>
  </div>
  
  <div>Date: <strong>${data.letterDate}</strong></div>
  
  <div class="recipient">
    <strong>${data.recipientName}</strong><br/>
    ${data.recipientTitle}<br/>
    <strong>${data.companyName}</strong><br/>
    ${data.companyAddress}
  </div>
  
  <div class="salutation">Dear ${data.recipientName},</div>
  
  <div class="subject">SUBJECT: RECOMMENDATION FOR INTERNSHIP / ON-THE-JOB TRAINING</div>
  
  <div class="content">
    <p>Greetings of Peace!</p>
    
    <p>In partial fulfillment of the academic requirements for the degree of <strong>Bachelor of Science in ${data.program}</strong> at National University Baliwag, our students are required to undergo an Internship Program consisting of <strong>${data.hours} hours</strong> of host-company training.</p>
    
    <p>In connection with this, we would like to formally recommend <strong>${data.studentName}</strong> to undergo his/her internship training at your prestigious organization, <strong>${data.companyName}</strong>, as a <strong>${data.position}</strong>.</p>
    
    <p>We believe that your company provides an excellent environment to nurture our students' technical skills, professional work ethic, and industry-readiness. Throughout this period, our student will remain subject to the academic policies and assessment guidelines set by National University Baliwag.</p>
    
    <p>We look forward to a fruitful and mutually beneficial partnership between your organization and our university. Thank you very much for your time and kind consideration.</p>
  </div>
  
  <div style="margin-top: 40px;">Sincerely yours,</div>
  
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">${data.adviserName}</div>
      <div>OJT Adviser</div>
      <div style="font-size: 12px; color: #475569;">School of Computing and IT</div>
    </div>
    
    <div class="sig-block">
      <div class="sig-line">Dr. Renato C. Valencia</div>
      <div>Dean, School of Computing and IT</div>
    </div>
  </div>
</body>
</html>
      `;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setToast({ message: 'Template generated successfully! Printing window opened.', type: 'success' });
  };

  const approvedCount = docs.filter(d => d.status === 'Approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {deploymentApproved && (
        <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: '16px', padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CheckCircle size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Deployment Approved! 🎉</div>
            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Your OJT Adviser cleared you. Stage 2 is now unlocked.</div>
          </div>
        </div>
      )}

      {/* Company Info */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
          <Building2 size={22} color={theme.colors.primary} /> Company Information
        </h2>
        {companySaved ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: <Building2 size={16} />, label: 'Company', value: companyForm.companyName },
              { icon: <MapPin size={16} />, label: 'Address', value: companyForm.companyAddress },
              { icon: <Briefcase size={16} />, label: 'Position', value: companyForm.position },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', backgroundColor: theme.colors.bgSecondary, borderRadius: '10px' }}>
                <span style={{ color: theme.colors.primary, marginTop: '1px' }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: 600, marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{r.value}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setCompanySaved(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, alignSelf: 'flex-start', marginTop: '6px' }}>Edit Info</button>
          </div>
        ) : (
          <form onSubmit={handleCompanySave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'companyName', label: 'Company Name', placeholder: 'e.g. NexGen Software Solutions' },
              { key: 'companyAddress', label: 'Company Address', placeholder: 'e.g. 21F Ayala Tower, BGC, Taguig City' },
              { key: 'position', label: 'Position / Role', placeholder: 'e.g. Full-Stack Developer Intern' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.875rem', color: theme.colors.textSecondary }}>{f.label}</label>
                <input required style={{ ...commonStyles.input, width: '100%', boxSizing: 'box-border' }} placeholder={f.placeholder}
                  value={companyForm[f.key]} onChange={e => setCompanyForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, alignSelf: 'flex-start' }}>
              <Send size={16} /> Save Company Info
            </button>
          </form>
        )}
      </div>

      {/* Document Templates & Generation */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px', background: 'linear-gradient(to bottom right, #ffffff, #fdfeff)' }}>
        <h2 style={{ margin: '0 0 8px 0', color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
          <Wand2 size={22} color={theme.colors.primary} /> Document Templates & Generation
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>
          Download blank school forms or dynamically generate pre-filled recommendation letters and parental consent forms with your student and company details.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Downloads Card */}
          <div style={{ flex: 1, minWidth: '280px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} color={theme.colors.primary} /> 1. Blank Official Forms
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: theme.colors.textMuted }}>Get the official blank PDF templates provided by CCIT to print or fill manually.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href="https://drive.google.com/drive/folders/18UGH4K7xJhRbO2HNUAagh9Ex-5_1YozU?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  ...commonStyles.dashboardBtn, 
                  backgroundColor: '#ffffff', 
                  color: theme.colors.textMain, 
                  border: '1px solid #cbd5e1', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}
              >
                <FileText size={14} color="#dc2626" /> Parental Consent (CCIT-FO-014)
              </a>
              <a 
                href="https://drive.google.com/drive/folders/18UGH4K7xJhRbO2HNUAagh9Ex-5_1YozU?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  ...commonStyles.dashboardBtn, 
                  backgroundColor: '#ffffff', 
                  color: theme.colors.textMain, 
                  border: '1px solid #cbd5e1', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}
              >
                <FileText size={14} color="#2563eb" /> Recommendation Letter (CCIT-FO-013)
              </a>
            </div>
          </div>

          {/* Generator Card */}
          <div style={{ flex: 1, minWidth: '280px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 700, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wand2 size={16} color="#d97706" /> 2. Pre-Filled Generator
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: theme.colors.textMuted }}>Compile completed print-ready copies instantly using your internship details.</p>
            
            {companySaved ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => openGenerator('consent')}
                  style={{ 
                    ...commonStyles.dashboardBtn, 
                    ...commonStyles.dashboardBtnPrimary, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <Wand2 size={14} /> Generate Parental Consent
                </button>
                <button 
                  onClick={() => openGenerator('recommendation')}
                  style={{ 
                    ...commonStyles.dashboardBtn, 
                    ...commonStyles.dashboardBtnPrimary, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <Wand2 size={14} /> Generate Recommendation Letter
                </button>
              </div>
            ) : (
              <div style={{ padding: '12px', border: '1px dashed #f59e0b', borderRadius: '8px', backgroundColor: '#fffbeb', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> Setup Required
                </span>
                <span style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.3 }}>
                  Please enter and save your **Company Information** above first to unlock the automatic document generator.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
            <FileText size={22} color={theme.colors.primary} /> Document Checklist
          </h2>
          <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted, fontWeight: 600 }}>{approvedCount}/{docs.length} Approved</span>
        </div>
        <div style={{ height: '8px', backgroundColor: theme.colors.bgSecondary, borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: docs.length > 0 ? `${(approvedCount / docs.length) * 100}%` : '0%', backgroundColor: '#16a34a', borderRadius: '4px', transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                width: '28px',
                height: '28px',
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted }}>Loading checklist...</span>
            </div>
          ) : docs.length === 0 ? (
             <div style={{ padding: '20px', textAlign: 'center', color: theme.colors.textMuted }}>No documents required yet.</div>
          ) : docs.map(doc => {
            const st = STATUS_CONFIG[doc.status === 'Approved' ? 'APPROVED' : doc.status === 'Pending review' ? 'PENDING' : doc.status.includes('Rejected') ? 'REJECTED' : 'NOT_SUBMITTED'];
            const isOpen = expandedDoc === doc.id;
            return (
              <div key={doc.id} style={{ border: `1px solid ${doc.status.includes('Rejected') ? '#fecaca' : theme.colors.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: doc.status.includes('Rejected') ? '#fff5f5' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpandedDoc(isOpen ? null : doc.id)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                    {st.icon} {st.label}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600, color: theme.colors.textMain, fontSize: '0.9rem' }}>{doc.name}</span>
                  {doc.submittedAt && <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{new Date(doc.submittedAt).toLocaleDateString()}</span>}
                  {isOpen ? <ChevronUp size={16} color={theme.colors.textMuted} /> : <ChevronDown size={16} color={theme.colors.textMuted} />}
                </div>
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                    {doc.status.includes('Rejected') && doc.comment && (
                      <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>OJT Adviser Comment:</div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>{doc.comment}</p>
                      </div>
                    )}

                    {doc.status === 'Pending review' && (
                      <div style={{ padding: '12px 14px', backgroundColor: '#fef9c3', borderRadius: '8px', borderLeft: '4px solid #d97706', fontSize: '0.825rem', color: '#854d0e', fontWeight: 600 }}>
                        Your document is submitted and pending review. You can undo submission to recall and modify it.
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {/* View Button */}
                      {doc.fileUrl && (
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            ...commonStyles.dashboardBtn, 
                            backgroundColor: doc.status === 'Approved' ? '#dcfce7' : '#eff6ff', 
                            color: doc.status === 'Approved' ? '#16a34a' : '#1d4ed8', 
                            border: `1px solid ${doc.status === 'Approved' ? '#bbf7d0' : '#bfdbfe'}`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          <Eye size={16} /> View Submitted File
                        </a>
                      )}

                      {/* Undo Submission button */}
                      {doc.status === 'Pending review' && (
                        <button
                          onClick={() => handleUndoSubmission(doc.id, doc.isAdditional)}
                          style={{
                            ...commonStyles.dashboardBtn,
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <RotateCcw size={16} /> Undo Submission
                        </button>
                      )}

                      {/* File Uploader for Not Submitted or Rejected states */}
                      {(doc.status === 'Not submitted' || doc.status.includes('Rejected')) && (
                        <div>
                          <input 
                            type="file" 
                            id={`file-${doc.id}`} 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            style={{ display: 'none' }} 
                            onChange={e => handleFileUpload(doc.id, e.target.files[0])} 
                          />
                          <label 
                            htmlFor={`file-${doc.id}`} 
                            style={{ 
                              ...commonStyles.dashboardBtn, 
                              ...commonStyles.dashboardBtnPrimary, 
                              cursor: 'pointer', 
                              display: 'inline-flex', 
                              gap: '8px',
                              fontSize: '0.85rem'
                            }}
                          >
                            <Upload size={16} /> {doc.status.includes('Rejected') ? 'Re-upload File' : 'Upload Document'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MOA + Deployment */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ ...commonStyles.dashboardCard, padding: '24px', flex: 1, minWidth: '240px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>MOA Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: MOA_COLORS[moaStatus] }} />
            <span style={{ fontWeight: 700, color: MOA_COLORS[moaStatus] }}>{MOA_LABELS[moaStatus]}</span>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>Updated by your OJT Adviser. Actual MOA drafting is handled offline.</p>
        </div>

        <div style={{ ...commonStyles.dashboardCard, padding: '24px', flex: 1, minWidth: '240px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: theme.colors.textMain }}>Deployment Status</h3>
          {deploymentApproved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700 }}><CheckCircle size={20} /> Approved — You're Deployed!</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textMuted, fontWeight: 600 }}><Clock size={20} color={theme.colors.warning} /> Awaiting OJT Adviser Approval</div>
          )}
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: theme.colors.textMuted }}>
            {deploymentApproved ? 'Your OJT Adviser approved your deployment. Proceed to Stage 2.' : 'OJT Adviser will approve after all documents and MOA are processed.'}
          </p>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      {/* Dynamic Document Generator Modal */}
      {generatorModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }} onClick={() => setGeneratorModal(prev => ({ ...prev, isOpen: false }))}>
          <div style={{
            backgroundColor: theme.colors.white,
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'modalFadeIn 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={20} color={theme.colors.primary} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.colors.textMain }}>
                  {generatorModal.type === 'consent' ? 'Parent Consent Form (CCIT-FO-014)' : 'Recommendation Letter (CCIT-FO-013)'}
                </h3>
              </div>
              <button 
                onClick={() => setGeneratorModal(prev => ({ ...prev, isOpen: false }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleGeneratePrintWindow} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Common Pre-filled Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Student & Company Details (Auto-filled)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <div><strong>Student Name:</strong> {generatorModal.formData.studentName}</div>
                  <div><strong>Program:</strong> {generatorModal.formData.program}</div>
                  <div><strong>Training Hours:</strong> {generatorModal.formData.hours} hrs</div>
                  <div><strong>Company:</strong> {generatorModal.formData.companyName}</div>
                </div>
              </div>

              {/* Conditional Inputs */}
              {generatorModal.type === 'consent' ? (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>Parent / Guardian Full Name</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. Maria Clara G. Ortiz"
                      style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                      value={generatorModal.formData.parentName}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, parentName: e.target.value }
                      }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>Parent Contact Number</label>
                      <input 
                        required 
                        type="tel"
                        placeholder="e.g. 0917XXXXXXX"
                        style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                        value={generatorModal.formData.parentContact}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, parentContact: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>OJT Start Date</label>
                      <input 
                        required 
                        type="date"
                        style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                        value={generatorModal.formData.startDate}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, startDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>OJT End Date</label>
                      <input 
                        required 
                        type="date"
                        style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                        value={generatorModal.formData.endDate}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, endDate: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>Recipient Name (e.g. Manager/HR)</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. Engr. Josephine B. Salazar"
                      style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                      value={generatorModal.formData.recipientName}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, recipientName: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>Recipient Position / Title</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. Regional Manager / HR Lead"
                      style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                      value={generatorModal.formData.recipientTitle}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, recipientTitle: e.target.value }
                      }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>Letter Date</label>
                      <input 
                        required 
                        type="text"
                        style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                        value={generatorModal.formData.letterDate}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, letterDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: theme.colors.textSecondary }}>OJT Coordinator</label>
                      <input 
                        required 
                        type="text"
                        style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                        value={generatorModal.formData.adviserName}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, adviserName: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setGeneratorModal(prev => ({ ...prev, isOpen: false }))}
                  style={{ ...commonStyles.dashboardBtn, flex: 1, backgroundColor: '#ffffff', color: theme.colors.textMain, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Printer size={16} /> Generate & Print
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
