// src/styles/theme.js
export const theme = {
  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgAccent: '#EFF6FF',
    primary: '#1E40AF',
    primaryHover: '#1D4ED8',
    primaryDark: '#1E3A8A', // Added to fix hover turning white
    secondary: '#3B82F6',
    accent: '#60A5FA',
    textMain: '#0F172A',
    textMuted: '#475569',
    textDark: '#334155',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(226, 232, 240, 0.8)',
    border: '#e2e8f0',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    white: '#FFFFFF',
    primaryLight: '#EBF1FF', // Blue 50-100 equivalent
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    accent: 'linear-gradient(135deg, #60A5FA 0%, #2DD4BF 100%)',
    dark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    radius: '12px',
  },
  transitions: {
    default: 'all 0.2s ease',
  }
};
