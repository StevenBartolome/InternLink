import React, { useState, useRef } from 'react';
import { X, UserPlus, Upload, Mail, User, FileText, Check, Loader2, Info, AlertCircle } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../context/AuthContext';
import { generatePassword } from '../../utils/passwordGenerator';
import { parseStudentCSV } from '../../utils/csvParser';
import { supabase } from '../../services/supabaseClient';
import emailjs from '@emailjs/browser';

const CreateStudentModal = ({ onClose, onSuccess }) => {
  const { user, createStudentAccount, bulkCreateStudentAccounts } = useAuth();
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Single Account State
  const [singleData, setSingleData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    course: '',
    programId: '',
    yearLevel: '4th Year',
    academicYear: '',
    semester: 'First Semester',
    ojtSubjectName: 'CCNTERN1',
    sectionId: ''
  });

  const [activeAY, setActiveAY] = useState('');
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeSections, setActiveSections] = useState([]);

  // Fetch active academic year
  React.useEffect(() => {
    const fetchAY = async () => {
      const { data } = await supabase.from('academic_years').select('year_range').eq('is_active', true).single();
      if (data) {
        setActiveAY(data.year_range);
        setSingleData(p => ({ ...p, academicYear: data.year_range }));
      }
    };

    const fetchPrograms = async () => {
      const { data } = await supabase.from('programs').select('id, code').order('code');
      if (data) {
        setPrograms(data);
        if (data.length > 0) {
          // If professor, they might already have a program_id in user context
          const defaultProg = user?.program_id ? data.find(p => p.id === user.program_id) : data[0];
          setSingleData(p => ({ ...p, course: defaultProg?.code || data[0].code, programId: defaultProg?.id || data[0].id }));
        }
      }
    };

    const fetchSections = async () => {
      const { data } = await supabase.from('program_sections').select('*').eq('is_active', true).order('name');
      if (data) {
        const profSectionIds = user?.professor_sections?.map(ps => ps.section_id) || [];
        // Only restrict if the professor has specific assignments
        if (profSectionIds.length > 0) {
          setSections(data.filter(s => profSectionIds.includes(s.id)));
        } else {
          setSections(data);
        }
      }
    };

    fetchAY();
    fetchPrograms();
    fetchSections();
  }, [user?.program_id]);

  // Filter sections when program changes
  React.useEffect(() => {
    if (singleData.programId) {
      setActiveSections(sections.filter(s => s.program_id === singleData.programId));
    }
  }, [singleData.programId, sections]);

  // Bulk Account State
  const [csvFile, setCsvFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const fileInputRef = useRef(null);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const password = generatePassword(10);
    const result = await createStudentAccount({ 
      ...singleData, 
      password,
      // For backend compatibility
      program_id: singleData.programId,
      course: singleData.course,
      year_level: singleData.yearLevel,
      academic_year: singleData.academicYear,
      semester: singleData.semester,
      ojt_subject_name: singleData.ojtSubjectName,
      section_id: singleData.sectionId
    });

    if (result.success) {
      // Send Email via EmailJS
      try {
        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_id',
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_id',
          {
            to_name: `${singleData.firstName} ${singleData.lastName}`,
            to_email: singleData.email,
            student_id: singleData.studentId,
            course: singleData.course,
            temp_password: password,
            login_url: `${window.location.origin}/login`
          },
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'public_key'
        );
        onSuccess(`Successfully created account for ${singleData.firstName}. Credentials emailed via EmailJS.`);
        onClose();
      } catch (emailErr) {
        console.error('EmailJS Error:', emailErr);
        onSuccess(`Account created for ${singleData.firstName}, but failed to send email. Password: ${password}`);
        onClose();
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const students = parseStudentCSV(text);
        setBulkPreview(students);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0) return;
    setLoading(true);
    setError('');

    const results = { success: [], failed: [], emailFailed: [] };

    for (const student of bulkPreview) {
      const password = generatePassword(10);
      const res = await createStudentAccount({ 
        ...student, 
        password,
        // Use values from CSV if present, otherwise fall back to defaults
        year_level: student.year_level || '4th Year',
        academic_year: student.academic_year || activeAY || '2024-2025',
        semester: student.semester || 'First Semester',
        ojt_subject_name: student.ojt_subject_name || 'CCNTERN1'
      });
      
      if (res.success) {
        // Send Email via EmailJS
        try {
          await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_id',
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_id',
            {
              to_name: `${student.firstName} ${student.lastName}`,
              to_email: student.email,
              student_id: student.studentId,
              course: student.course,
              temp_password: password,
              login_url: `${window.location.origin}/login`
            },
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'public_key'
          );
          results.success.push(student.email);
        } catch (emailErr) {
          console.error('EmailJS Bulk Error:', emailErr);
          results.emailFailed.push(student.email);
        }
      } else {
        results.failed.push({ email: student.email, error: res.error });
      }
    }

    setLoading(false);
    if (results.failed.length === 0 && results.emailFailed.length === 0) {
      onSuccess(`Successfully created ${results.success.length} accounts and sent emails.`);
      onClose();
    } else {
      const msg = `Created ${results.success.length + results.emailFailed.length} accounts. ` + 
                  (results.failed.length > 0 ? `Failed: ${results.failed.length}. ` : '') +
                  (results.emailFailed.length > 0 ? `Emails failed: ${results.emailFailed.length}.` : '');
      setError(msg);
      if (results.success.length > 0) onSuccess(msg);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '16px',
      width: '100%', maxWidth: '550px',
      maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    },
    header: {
      padding: '1.5rem', borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    tabs: {
      display: 'flex', padding: '0 1.5rem',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    tab: (active) => ({
      padding: '1rem 1.5rem', cursor: 'pointer',
      color: active ? theme.colors.primary : theme.colors.textMuted,
      borderBottom: `2px solid ${active ? theme.colors.primary : 'transparent'}`,
      fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
    }),
    content: { padding: '1.5rem' },
    formGroup: { marginBottom: '1.25rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: theme.colors.textMain, marginBottom: '0.5rem' },
    inputWrap: { position: 'relative' },
    input: {
      width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
      borderRadius: '10px', border: `1px solid ${theme.colors.border}`,
      fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    },
    inputIcon: { position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.textMuted },
    dropZone: {
      border: `2px dashed ${theme.colors.border}`, borderRadius: '12px',
      padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer',
      backgroundColor: theme.colors.bgSecondary, transition: 'all 0.2s',
      ':hover': { borderColor: theme.colors.primary }
    },
    previewList: {
      marginTop: '1.5rem', maxHeight: '200px', overflowY: 'auto',
      borderRadius: '8px', border: `1px solid ${theme.colors.border}`,
    },
    previewItem: {
      padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '2px'
    },
    previewRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#eff6ff', color: theme.colors.primary, padding: '8px', borderRadius: '10px' }}>
              <UserPlus size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 }}>Create Student Account</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.tabs}>
          <div style={styles.tab(activeTab === 'single')} onClick={() => setActiveTab('single')}>Single Account</div>
          <div style={styles.tab(activeTab === 'bulk')} onClick={() => setActiveTab('bulk')}>Bulk Upload</div>
        </div>

        <div style={styles.content}>
          {error && (
            <div style={{ ...commonStyles.errorAlert, marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {activeTab === 'single' ? (
            <form onSubmit={handleSingleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <div style={styles.inputWrap}>
                    <User size={18} style={styles.inputIcon} />
                    <input
                      type="text" required placeholder="John" style={styles.input}
                      value={singleData.firstName} onChange={e => setSingleData(p => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <div style={styles.inputWrap}>
                    <User size={18} style={styles.inputIcon} />
                    <input
                      type="text" required placeholder="Doe" style={styles.input}
                      value={singleData.lastName} onChange={e => setSingleData(p => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Student Email</label>
                <div style={styles.inputWrap}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email" required placeholder="student@university.edu" style={styles.input}
                    value={singleData.email} onChange={e => setSingleData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Student ID (Optional)</label>
                  <div style={styles.inputWrap}>
                    <FileText size={18} style={styles.inputIcon} />
                    <input
                      type="text" placeholder="2024-0001" style={styles.input}
                      value={singleData.studentId} onChange={e => setSingleData(p => ({ ...p, studentId: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Course</label>
                  <select
                    style={{ ...styles.input, paddingLeft: '1rem' }}
                    value={singleData.programId} 
                    onChange={e => {
                      const prog = programs.find(p => p.id === e.target.value);
                      setSingleData(p => ({ ...p, programId: e.target.value, course: prog?.code || '' }));
                    }}
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.code}</option>
                    ))}
                    {programs.length === 0 && <option value="">No programs available</option>}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Semester</label>
                  <select
                    style={{ ...styles.input, paddingLeft: '1rem' }}
                    value={singleData.semester} onChange={e => setSingleData(p => ({ ...p, semester: e.target.value }))}
                  >
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                    <option value="Third Semester">Third Semester</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>OJT Subject Name</label>
                  <select
                    style={{ ...styles.input, paddingLeft: '1rem' }}
                    value={singleData.ojtSubjectName} onChange={e => setSingleData(p => ({ ...p, ojtSubjectName: e.target.value }))}
                  >
                    <option value="CCNTERN1">CCNTERN1</option>
                    <option value="CCNTERN2">CCNTERN2</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Section</label>
                <select
                  style={{ ...styles.input, paddingLeft: '1rem' }}
                  value={singleData.sectionId} 
                  onChange={e => setSingleData(p => ({ ...p, sectionId: e.target.value }))}
                >
                  <option value="">Select Section...</option>
                  {activeSections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {activeSections.length === 0 && <option value="" disabled>No active sections</option>}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Year Level</label>
                  <input
                    type="text" readOnly style={{ ...styles.input, paddingLeft: '1rem', backgroundColor: '#f8fafc' }}
                    value={singleData.yearLevel}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Academic Year</label>
                  <input
                    type="text" placeholder="2024-2025" style={{ ...styles.input, paddingLeft: '1rem' }}
                    value={singleData.academicYear} onChange={e => setSingleData(p => ({ ...p, academicYear: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '10px', fontSize: '0.85rem', color: '#0369a1', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>The password will be auto-generated and emailed via <strong>EmailJS</strong> immediately.</span>
              </div>

              <button type="submit" disabled={loading} style={{ ...commonStyles.dashboardBtnPrimary, width: '100%', padding: '0.875rem' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : <>Create Account</>}
              </button>
            </form>
          ) : (
            <div>
              <div style={styles.dropZone} onClick={() => fileInputRef.current.click()}>
                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
                <Upload size={32} color={theme.colors.primary} style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 700, margin: '0 0 4px 0' }}>Upload Student CSV</p>
                <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, margin: 0 }}>Required Columns: StudentID, FirstName, LastName, Email, Course</p>
              </div>

              {bulkPreview.length > 0 && (
                <>
                  <div style={styles.previewList}>
                    {bulkPreview.map((s, i) => (
                      <div key={i} style={styles.previewItem}>
                        <div style={styles.previewRow}>
                          <span style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</span>
                          <span style={{ color: theme.colors.primary, fontSize: '0.75rem', fontWeight: 700 }}>{s.course}</span>
                        </div>
                        <div style={styles.previewRow}>
                          <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>{s.email}</span>
                          <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>ID: {s.studentId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleBulkSubmit} disabled={loading}
                    style={{ ...commonStyles.dashboardBtnPrimary, width: '100%', padding: '0.875rem', marginTop: '1.5rem' }}
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating {bulkPreview.length} Accounts...</> : <>Create {bulkPreview.length} Accounts</>}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStudentModal;
