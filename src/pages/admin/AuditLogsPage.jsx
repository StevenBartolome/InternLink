import React, { useState, useEffect } from 'react';
import { 
  Search, Download, 
  Filter, Calendar,
  User, AlertTriangle, RefreshCw
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import Toast from '../../components/common/Toast';
import { supabase } from '../../services/supabaseClient';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterAction, setFilterAction] = useState('All Actions');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
      showToast('Failed to load audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const allTypes = ['All Types', ...new Set(logs.map(l => l.type))];
  const allActions = ['All Actions', ...new Set(logs.map(l => l.action))];

  const filteredLogs = logs.filter(log => {
    const userSearch = log.user_name || '';
    const actionSearch = log.action || '';
    const matchesSearch = userSearch.toLowerCase().includes(searchTerm.toLowerCase()) || 
      actionSearch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All Types' || log.type === filterType;
    const matchesAction = filterAction === 'All Actions' || log.action === filterAction;
    return matchesSearch && matchesType && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp,User,Role,Action,Affected Record,Type,IP Address'];
    const rows = filteredLogs.map(log =>
      `"${log.timestamp}","${log.user}","${log.role}","${log.action}","${log.affectedRecord}","${log.type}","${log.ipAddress}"`
    );
    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredLogs.length} log entries to CSV.`, 'success');
  };

  const handleDateFilter = () => {
    showToast('Date range filtering is available in the full version.', 'info');
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
    tableContainer: { ...commonStyles.dashboardTableContainer },
    table: { ...commonStyles.dashboardTable },
    th: { ...commonStyles.dashboardTableTh },
    td: { ...commonStyles.dashboardTableTd },
    typeBadge: (type) => {
      const colors = {
        Update: { color: theme.colors.warning, bg: '#FEF3C7' },
        Create: { color: theme.colors.success, bg: '#DEF7EC' },
        Delete: { color: theme.colors.danger, bg: '#FDE8E8' },
        System: { color: theme.colors.primary, bg: '#E1EFFE' },
        Login: { color: theme.colors.textMuted, bg: '#F3F4F6' },
      };
      const c = colors[type] || colors.System;
      return { ...commonStyles.dashboardBadge, color: c.color, backgroundColor: c.bg };
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Security Audit Logs</h1>
          {(filterType !== 'All Types' || filterAction !== 'All Actions') && (
            <span style={{ fontSize: '0.8rem', color: theme.colors.primary, fontWeight: 600 }}>
              Showing filtered results ({filteredLogs.length} entries)
            </span>
          )}
        </div>
        <button
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
          onClick={handleExportCSV}
        >
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ ...commonStyles.dashboardBtn, backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}`, padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {allTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ ...commonStyles.dashboardBtn, backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}`, padding: '8px 12px', fontSize: '0.85rem', maxWidth: '200px', cursor: 'pointer' }}
          >
            {allActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <button
            title="Filter by date range"
            style={{ ...commonStyles.dashboardBtn, backgroundColor: theme.colors.bgSecondary, padding: '8px' }}
            onClick={handleDateFilter}
          >
            <Calendar size={18} />
          </button>
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
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      border: `3px solid ${theme.colors.primary}20`,
                      borderTop: `3px solid ${theme.colors.primary}`,
                      borderRadius: '50%',
                      animation: 'spin-loader 0.8s linear infinite',
                      marginBottom: '12px'
                    }} />
                    <style>{`
                      @keyframes spin-loader {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted }}>Loading real-time logs...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>No logs found.</td></tr>
            ) : filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ ...styles.td, fontSize: '0.8rem', color: theme.colors.textMuted }}>
                   {new Date(log.timestamp).toLocaleString()}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color={theme.colors.primary} />
                    <span style={{ fontWeight: 600 }}>{log.user_name}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{log.user_role?.toUpperCase()}</div>
                </td>
                <td style={styles.td}>{log.action}</td>
                <td style={styles.td}>{log.affected_record}</td>
                <td style={styles.td}>
                  <span style={styles.typeBadge(log.type)}>{log.type}</span>
                </td>
                <td style={{ ...styles.td, fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
