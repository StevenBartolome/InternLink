import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileQuestion
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';

const Documents = () => {
  const documents = [
    { name: 'Medical certificate', status: 'Approved' },
    { name: 'Consent form', status: 'Approved' },
    { name: 'Resume / CV', status: 'Rejected - re-upload' },
    { name: 'Endorsement letter', status: 'Pending review' },
    { name: 'Parent / guardian waiver', status: 'Not submitted' },
    { name: 'Acceptance proof from company', status: 'Not submitted' },
  ];

  const getStatusStyle = (status) => {
    if (status === 'Approved') return studentDesign.colors.status.done;
    if (status === 'Pending review') return studentDesign.colors.status.active;
    if (status.includes('Rejected')) return studentDesign.colors.status.error;
    return studentDesign.colors.status.neutral;
  };

  const getStatusIcon = (status) => {
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
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.uploadButton}
        >
          <Upload size={18} /> Upload document
        </motion.button>
      </div>

      <div style={styles.docList}>
        {documents.map((doc, idx) => (
          <div key={idx} style={{ ...styles.docRow, borderBottom: idx === documents.length - 1 ? 'none' : styles.docRow.borderBottom }}>
            <div style={styles.docInfo}>
              <div style={styles.fileIcon}>
                <FileText size={20} />
              </div>
              <span style={styles.docName}>{doc.name}</span>
            </div>
            <div style={styles.statusBadge(doc.status)}>
              {getStatusIcon(doc.status)}
              {doc.status}
            </div>
          </div>
        ))}

        <div style={styles.footer}>
          <div style={styles.footerText}>
            <div style={styles.statusDot(true)} />
            MOA Status: <strong>Company MOA Active</strong>
          </div>
          <div style={styles.footerText}>
            <div style={styles.statusDot(false)} />
            Deployment Approval: <strong>Pending Document Completion</strong>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Documents;
