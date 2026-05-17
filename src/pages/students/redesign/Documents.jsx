import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileQuestion,
  Loader2
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { studentService } from '../../../services/studentService';
import { adminService } from '../../../services/adminService';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(null); // ID of document being uploaded

  React.useEffect(() => {
    if (user?.internship_id) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const programId = user.program_id || user.profile?.program_id;
      
      // AUTO-SYNC: Always sync the student checklist with the program template to fetch any newly added required documents
      if (user.internship_id && programId) {
        console.log('Syncing student checklist with program requirements template...');
        await adminService.syncStudentChecklist(user.internship_id, programId);
      }
      
      const docs = await studentService.getPreInternshipDocuments(user.internship_id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(docId);
      await studentService.uploadDocument(docId, file);
      await fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'Approved') return studentDesign.colors.status.done;
    if (status === 'Pending review') return studentDesign.colors.status.active;
    if (status.includes('Rejected')) return studentDesign.colors.status.error;
    return studentDesign.colors.status.neutral;
  };

  const getStatusIcon = (status, docId) => {
    if (uploading === docId) return <Loader2 size={16} className="animate-spin" />;
    if (status === 'Approved') return <CheckCircle2 size={16} />;
    if (status === 'Pending review') return <Clock size={16} />;
    if (status.includes('Rejected')) return <AlertCircle size={16} />;
    return <FileQuestion size={16} />;
  };

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
    },
    uploadButton: {
      padding: '10px 20px',
      borderRadius: '12px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    },
    docList: {
      ...studentDesign.card,
      padding: '8px 24px',
    },
    docRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    docInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    fileIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: studentDesign.colors.primaryLight,
      color: studentDesign.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    docName: {
      fontSize: '14px',
      fontWeight: studentDesign.typography.weights.medium,
      color: studentDesign.colors.textMain,
    },
    statusBadge: (status) => {
      const colors = getStatusStyle(status);
      return {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: studentDesign.typography.weights.semibold,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      };
    },
    footer: {
      marginTop: '16px',
      padding: '16px 24px',
      borderTop: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    footerText: {
      fontSize: '13px',
      color: studentDesign.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    statusDot: (active) => ({
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: active ? studentDesign.colors.success : studentDesign.colors.border,
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <div style={styles.header}>
        <h2 style={{ fontSize: '18px', fontWeight: studentDesign.typography.weights.semibold }}>Required Documents</h2>
        <div style={{ fontSize: '13px', color: studentDesign.colors.textMuted }}>
          {documents.filter(d => d.status === 'Approved').length} of {documents.length} completed
        </div>
      </div>

      <div style={styles.docList}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: studentDesign.colors.textMuted }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            Loading checklist...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: studentDesign.colors.textMuted }}>
            <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            No documents required at this time.
          </div>
        ) : (
          documents.map((doc, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            borderBottom: idx === documents.length - 1 ? 'none' : `1px solid ${studentDesign.colors.border}` 
          }}>
            <div style={styles.docRow}>
              <div style={styles.docInfo}>
                <div style={styles.fileIcon}>
                  <FileText size={20} />
                </div>
                <span style={styles.docName}>{doc.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.statusBadge(doc.status)}>
                  {getStatusIcon(doc.status, doc.id)}
                  {doc.status}
                </div>
                {doc.status !== 'Approved' && (
                  <>
                    <input 
                      type="file" 
                      id={`file-${doc.id}`} 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleFileUpload(doc.id, e)}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => document.getElementById(`file-${doc.id}`).click()}
                      disabled={uploading === doc.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        color: studentDesign.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        backgroundColor: studentDesign.colors.primaryLight,
                      }}
                    >
                      <Upload size={16} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
            
            {doc.comment && (
              <div style={{ 
                padding: '0 0 16px 52px', 
                marginTop: '-8px' 
              }}>
                <div style={{ 
                  backgroundColor: doc.status.includes('Rejected') ? '#fff5f5' : '#f8fafc', 
                  padding: '10px 14px', 
                  borderRadius: '10px',
                  borderLeft: `3px solid ${doc.status.includes('Rejected') ? studentDesign.colors.danger : studentDesign.colors.primary}`,
                  fontSize: '13px',
                  color: doc.status.includes('Rejected') ? '#991b1b' : studentDesign.colors.textMuted,
                  lineHeight: 1.5
                }}>
                  <strong>Adviser Feedback:</strong> {doc.comment}
                </div>
              </div>
            )}
          </div>
        )))}

        <div style={styles.footer}>
          <div style={styles.footerText}>
            <div style={styles.statusDot(user?.moa_status === 'PROCESSED')} />
            MOA Status: <strong>{user?.moa_status === 'PROCESSED' ? 'Company MOA Active' : 'Pending MOA'}</strong>
          </div>
          <div style={styles.footerText}>
            <div style={styles.statusDot(user?.is_deployed)} />
            Deployment Approval: <strong>{user?.is_deployed ? 'Approved' : 'Pending Document Completion'}</strong>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Documents;
