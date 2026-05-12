import { theme } from './theme';

export const studentDesign = {
  colors: {
    ...theme.colors,
    // Premium additions
    primaryGradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    status: {
      done: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
      active: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
      locked: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
      error: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
      neutral: { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' }
    }
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px'
    }
  },
  shadows: {
    premium: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
  },
  glass: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
  }
};
