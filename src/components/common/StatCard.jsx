import React, { useState } from 'react';
import { theme } from '../../styles/theme';

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColor = () => {
    switch (color) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  const accentColor = getColor();

  const styles = {
    card: {
      backgroundColor: theme.colors.white,
      padding: '24px',
      borderRadius: '20px',
      border: `1px solid ${isHovered ? accentColor : theme.colors.border}`,
      boxShadow: isHovered ? theme.shadows.lg : theme.shadows.sm,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      cursor: 'pointer',
      transition: theme.transitions.default,
      transform: isHovered ? 'translateY(-4px)' : 'none',
    },
    iconWrapper: {
      width: '56px',
      height: '56px',
      borderRadius: '16px',
      backgroundColor: `${accentColor}15`, // 15% opacity
      color: accentColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'none',
    },
    info: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    value: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      lineHeight: 1.2,
    },
    title: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.iconWrapper}>
        <Icon size={28} />
      </div>
      <div style={styles.info}>
        <div style={styles.value}>{value}</div>
        <div style={styles.title}>{title}</div>
      </div>
    </div>
  );
};

export default StatCard;
