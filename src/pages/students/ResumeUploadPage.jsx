import React, { useState } from 'react';
import { 
  FileText, Upload, Trash2, 
  CheckCircle, Download, Info,
  AlertCircle, File, Eye
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { studentProfile } from '../../data/mockData';

const ResumeUploadPage = () => {
  const [files, setFiles] = useState(studentProfile.resumeFiles);
  const [isUploading, setIsUploading] = useState(false);

  const deleteFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    uploadCard: {
      ...commonStyles.dashboardCard,
      padding: '40px',
      border: `2px dashed ${theme.colors.border}`,
      backgroundColor: theme.colors.bgSecondary,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': { borderColor: theme.colors.primary, backgroundColor: theme.colors.bgAccent },
    },
    fileItem: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      marginBottom: '12px',
    }
  };

  return (
    <div style={styles.container}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Resume Management</h1>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Upload and manage your professional documents for internship applications.</p>
      </header>

      <div style={styles.uploadCard}>
        <Upload size={48} color={theme.colors.primary} style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>Upload New Document</h3>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>Drag and drop your resume file here or click to browse (PDF preferred)</p>
      </div>

      <div style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>My Documents ({files.length})</h3>
        {files.map(file => (
          <div key={file.id} style={styles.fileItem}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#EBF1FF', padding: '10px', borderRadius: '10px', color: theme.colors.primary }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{file.filename}</div>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Uploaded on {file.date}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '8px', background: 'none', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}><Eye size={18} /></button>
              <button style={{ padding: '8px', background: 'none', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}><Download size={18} /></button>
              <button 
                style={{ padding: '8px', background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}
                onClick={() => deleteFile(file.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...commonStyles.dashboardCard, backgroundColor: theme.colors.bgAccent, display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Info size={20} color={theme.colors.primary} />
        <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textMuted }}>Your primary resume is automatically attached to every application unless otherwise specified.</p>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
