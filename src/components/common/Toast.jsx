import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { theme } from '../../styles/theme';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} color={theme.colors.success} />,
    error: <XCircle size={20} color={theme.colors.danger} />,
    info: <Info size={20} color={theme.colors.info} />,
    warning: <AlertTriangle size={20} color={theme.colors.warning} />,
  };

  const styles = {
    container: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: theme.colors.white,
      padding: '12px 16px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      zIndex: 100000,
      border: `1px solid ${theme.colors.border}`,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      maxWidth: '400px',
    },
    message: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: theme.colors.textMain,
      flex: 1,
      wordBreak: 'break-word',
      whiteSpace: 'normal',
      lineHeight: '1.4',
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      color: theme.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: '1px',
    }
  };

  return (
    <div style={styles.container}>
      {icons[type]}
      <span style={styles.message}>{message}</span>
      <button style={styles.closeBtn} onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
