import React from 'react';
import { theme } from '../../../styles/theme';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'success', isConfirm = false, onConfirm }) => {
  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    },
    content: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      padding: '32px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      animation: 'modalFadeIn 0.3s ease-out',
    },
    iconWrapper: {
      width: '64px',
      height: '64px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      backgroundColor: type === 'success' ? '#ECFDF5' : (type === 'error' || type === 'danger') ? '#FEF2F2' : '#FFFBEB',
      color: type === 'success' ? theme.colors.success : (type === 'error' || type === 'danger') ? theme.colors.danger : theme.colors.warning,
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 12px 0',
    },
    message: {
      fontSize: '1rem',
      color: theme.colors.textMuted,
      lineHeight: 1.6,
      margin: '0 0 32px 0',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      width: '100%',
    },
    btn: (isPrimary) => ({
      flex: 1,
      padding: '12px 20px',
      borderRadius: '14px',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: theme.transitions.default,
      border: isPrimary ? 'none' : `1px solid ${theme.colors.border}`,
      backgroundColor: isPrimary ? (type === 'warning' ? theme.colors.warning : ((type === 'error' || type === 'danger') ? theme.colors.danger : theme.colors.primary)) : theme.colors.white,
      color: isPrimary ? theme.colors.white : theme.colors.textMain,
    })
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconWrapper}>
          {type === 'success' && <CheckCircle2 size={32} />}
          {type === 'error' && <XCircle size={32} />}
          {(type === 'warning' || type === 'danger') && <AlertCircle size={32} />}
          {type === 'info' && <HelpCircle size={32} />}
        </div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        
        <div style={styles.actions}>
          {isConfirm ? (
            <>
              <button style={styles.btn(false)} onClick={onClose}>
                Cancel
              </button>
              <button style={styles.btn(true)} onClick={onConfirm}>
                Confirm
              </button>
            </>
          ) : (
            <button style={styles.btn(true)} onClick={onClose}>
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

