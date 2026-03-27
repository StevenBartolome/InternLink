// src/styles/commonStyles.js
import { theme } from './theme';

export const commonStyles = {
  dashboardCard: {
    background: theme.colors.bgPrimary,
    borderRadius: theme.shadows.radius,
    boxShadow: theme.shadows.md,
    padding: '1.5rem',
    border: `1px solid ${theme.colors.border}`,
    transition: theme.transitions.default,
  },
  dashboardTableContainer: {
    overflowX: 'auto',
    background: theme.colors.bgPrimary,
    borderRadius: '12px',
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.border}`,
  },
  dashboardTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  dashboardTableTh: {
    padding: '1rem',
    background: theme.colors.bgSecondary,
    fontWeight: '600',
    color: theme.colors.textMuted,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  dashboardTableTd: {
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.border}`,
    verticalAlign: 'middle',
  },
  dashboardBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
    textTransform: 'capitalize',
  },
  badgeSuccess: { backgroundColor: '#DEF7EC', color: '#03543F' },
  badgeWarning: { backgroundColor: '#FEF3C7', color: '#92400E' },
  badgeDanger: { backgroundColor: '#FDE8E8', color: '#9B1C1C' },
  badgeInfo: { backgroundColor: '#E1EFFE', color: '#1E429F' },
  badgeDefault: { backgroundColor: '#F3F4F6', color: '#374151' },
  dashboardBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: theme.transitions.default,
    border: 'none',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  dashboardBtnPrimary: {
    background: theme.colors.primary,
    color: theme.colors.white,
  },
  dashboardBtnSecondary: {
    background: theme.colors.bgPrimary,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textMain,
  },
};
