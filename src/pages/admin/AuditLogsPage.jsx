import React, { useState } from 'react';
import { 
  Shield, Search, Download, 
  Filter, Calendar, Activity,
  Server, User, Info, 
  Trash2, RotateCcw
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { auditLogs } from '../../data/adminMockData';

const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    tableContainer: {
      ...commonStyles.dashboardTableContainer,
    },
    table: {
      ...commonStyles.dashboardTable,
    },
    th: {
      ...commonStyles.dashboardTableTh,
    },
    td: {
      ...commonStyles.dashboardTableTd,
    },
    typeBadge: (type) => {
      const colors = {
        Update: { color: theme.colors.warning, bg: '#FEF3C7' },
        Create: { color: theme.colors.success, bg: '#DEF7EC' },
        Delete: { color: theme.colors.danger, bg: '#FDE8E8' },
        System: { color: theme.colors.primary, bg: '#E1EFFE' },
        Login: { color: theme.colors.textMuted, bg: '#F3F4F6' },
      };
      const c = colors[type] || colors.System;
      return {
        ...commonStyles.dashboardBadge,
        color: c.color,
        backgroundColor: c.bg,
      };
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Security Audit Logs</h1>
        <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>
          <Download size={18} />
          Export CSV
        </button>
      </header>

      <div style={{ ...commonStyles.dashboardCard, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color={theme.colors.textMuted} />
        <input 
          placeholder="Search by user or action..." 
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ ...commonStyles.dashboardBtn, backgroundColor: theme.colors.bgSecondary, padding: '8px' }}><Filter size={18} /></button>
          <button style={{ ...commonStyles.dashboardBtn, backgroundColor: theme.colors.bgSecondary, padding: '8px' }}><Calendar size={18} /></button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Affected Record</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ ...styles.td, fontSize: '0.8rem', color: theme.colors.textMuted }}>{log.timestamp}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color={theme.colors.primary} />
                    <span style={{ fontWeight: 600 }}>{log.user}</span>
                  </div>
                </td>
                <td style={styles.td}>{log.action}</td>
                <td style={styles.td}>{log.affectedRecord}</td>
                <td style={styles.td}>
                  <span style={styles.typeBadge(log.type)}>{log.type}</span>
                </td>
                <td style={{ ...styles.td, fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
