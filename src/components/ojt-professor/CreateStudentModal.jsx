import React, { useState, useRef } from 'react';
import { X, UserPlus, Upload, Mail, User, FileText, Check, Loader2, Info, AlertCircle } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../context/AuthContext';
import { generatePassword } from '../../utils/passwordGenerator';
import { parseStudentCSV } from '../../utils/csvParser';

const CreateStudentModal = ({ onClose, onSuccess }) => {
  const { createStudentAccount, bulkCreateStudentAccounts } = useAuth();
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Single Account State
  const [singleData, setSingleData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    course: 'BSIT'
  });

  // Bulk Account State
  const [csvFile, setCsvFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const fileInputRef = useRef(null);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const password = generatePassword(10);
    const result = await createStudentAccount({ ...singleData, password });

    setLoading(false);
    if (result.success) {
      onSuccess(`Successfully created account for ${singleData.firstName}. Credentials emailed to ${singleData.email}`);
      onClose();
    } else {
      setError(result.error);
    }
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

    const results = await bulkCreateStudentAccounts(bulkPreview);

    setLoading(false);
    if (results.failed.length === 0) {
      onSuccess(`Successfully created ${results.success.length} accounts.`);
      onClose();
    } else {
      setError(`Created ${results.success.length} accounts. Failed to create ${results.failed.length} accounts.`);
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
      fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between',
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
                    value={singleData.course} onChange={e => setSingleData(p => ({ ...p, course: e.target.value }))}
                  >
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIS">BSIS</option>
                    <option value="BSCPE">BSCPE</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '10px', fontSize: '0.85rem', color: '#0369a1', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>The password will be auto-generated and emailed to the student immediately after creation.</span>
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
                <p style={{ fontWeight: 700, margin: '0 0 4px 0' }}>Upload CSV File</p>
                <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, margin: 0 }}>Format: Email, FirstName, LastName, StudentID</p>
              </div>

              {bulkPreview.length > 0 && (
                <>
                  <div style={styles.previewList}>
                    {bulkPreview.map((s, i) => (
                      <div key={i} style={styles.previewItem}>
                        <span>{s.firstName} {s.lastName}</span>
                        <span style={{ color: theme.colors.textMuted }}>{s.email}</span>
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
