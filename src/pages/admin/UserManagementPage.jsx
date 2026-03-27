import React, { useState } from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  UserPlus, Shield, ShieldAlert, CheckCircle,
  XCircle, Mail, Edit
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { usersList } from '../../data/adminMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const UserManagementPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginTop: '16px',
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
    roleBadge: (role) => {
      const colors = {
        Student: { bg: '#E1EFFE', text: '#1E429F' },
        Employer: { bg: '#DEF7EC', text: '#03543F' },
        Coordinator: { bg: '#FEF3C7', text: '#92400E' },
        Supervisor: { bg: '#F3F4F6', text: '#374151' },
        Admin: { bg: '#EBF1FF', text: '#1E40AF' }
      };
      const color = colors[role] || colors.Admin;
      return {
        ...commonStyles.dashboardBadge,
        backgroundColor: color.bg,
        color: color.text,
      };
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
          <UserPlus size={18} />
          Add New User
        </button>
      </header>

      <div style={styles.controls}>
        <div style={{ ...commonStyles.dashboardCard, flex: 1, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} color={theme.colors.textMuted} />
          <input 
            placeholder="Search by name or email..." 
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          style={{ ...commonStyles.dashboardCard, padding: '10px', fontSize: '0.9rem', outline: 'none', border: `1px solid ${theme.colors.border}` }}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          {['All', 'Student', 'Employer', 'Coordinator', 'Supervisor', 'Admin'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: theme.colors.primary }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.roleBadge(user.role)}>{user.role}</span>
                </td>
                <td style={styles.td}>
                  <span style={{ 
                    ...commonStyles.dashboardBadge,
                    ...(user.status === 'Active' ? commonStyles.badgeSuccess : 
                       user.status === 'Pending' ? commonStyles.badgeWarning : commonStyles.badgeDanger)
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={styles.td}>{user.dateRegistered}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: theme.colors.primary, cursor: 'pointer' }}><Edit size={16} /></button>
                    <button style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}><ShieldAlert size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
