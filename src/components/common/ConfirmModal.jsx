import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" 
}) => {
  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
    },
    content: {
      backgroundColor: theme.colors.white,
      borderRadius: '20px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    closeBtn: {
      position: 'absolute',
      right: '20px',
      top: '20px',
      background: 'none',
      border: 'none',
      color: theme.colors.textMuted,
      cursor: 'pointer',
    },
    iconWrapper: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: type === 'danger' ? '#FEE2E2' : '#EBF1FF',
      color: type === 'danger' ? theme.colors.danger : theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
    },
    body: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 800,
      margin: '0 0 12px 0',
      color: theme.colors.textMain,
    },
    message: {
      fontSize: '0.9rem',
      color: theme.colors.textMuted,
      lineHeight: 1.5,
      margin: 0,
    },
    actions: {
      display: 'flex',
      gap: '12px',
      width: '100%',
    },
    btn: {
      ...commonStyles.dashboardBtn,
      flex: 1,
      padding: '12px',
      fontSize: '0.95rem',
      fontWeight: 700,
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div style={styles.iconWrapper}>
          <AlertTriangle size={28} />
        </div>

        <div style={styles.body}>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.actions}>
          <button style={{ ...styles.btn, ...commonStyles.dashboardBtnSecondary }} onClick={onClose}>
            {cancelText}
          </button>
          <button 
            style={{ 
              ...styles.btn, 
              backgroundColor: type === 'danger' ? theme.colors.danger : theme.colors.primary, 
              color: '#fff' 
            }} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
