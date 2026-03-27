import React, { useState } from 'react';
import { theme } from '../../../styles/theme';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Color mapping for icons
  const colorMap = {
    primary: { bg: '#EFF6FF', color: theme.colors.primary },
    success: { bg: '#dcfce7', color: '#166534' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    danger: { bg: '#fee2e2', color: '#991b1b' },
    info: { bg: '#e0f2fe', color: '#075985' }
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  const styles = {
    card: {
      background: theme.colors.white,
      borderRadius: theme.shadows.radius,
      boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.05)' : theme.shadows.sm,
      padding: '1.5rem',
      border: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: theme.transitions.default,
      transform: isHovered ? 'translateY(-2px)' : 'none',
      cursor: 'default'
    },
    iconWrapper: {
      padding: '1rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: selectedColor.bg,
      color: selectedColor.color
    },
    content: {
      display: 'flex',
      flexDirection: 'column'
    },
    title: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.colors.textMuted
    },
    value: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      margin: '0.25rem 0'
    },
    trend: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: trend?.type === 'up' ? theme.colors.success : theme.colors.danger
    }
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.iconWrapper}>
        {Icon && <Icon size={24} />}
      </div>
      <div style={styles.content}>
        <span style={styles.title}>{title}</span>
        <h3 style={styles.value}>{value}</h3>
        {trend && (
          <span style={styles.trend}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.value} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
