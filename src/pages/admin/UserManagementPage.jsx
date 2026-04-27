import React, { useState } from 'react';
import { 
  Users, Search,
  UserPlus, ShieldAlert, Edit, X, Save, Check
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { usersList } from '../../services/mocks/adminMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Toast from '../../components/common/Toast';

const UserManagementPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [users, setUsers] = useState(usersList);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEditStart = (user) => {
    setEditingId(user.id);
    setEditName(user.name);
  };

  const handleEditSave = (id) => {
    if (!editName.trim()) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, name: editName } : u));
    setEditingId(null);
    showToast('User details updated successfully.', 'success');
  };

  const handleToggleSuspend = (id, name, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(
      newStatus === 'Suspended'
        ? `${name} has been suspended.`
        : `${name} has been reactivated.`,
      newStatus === 'Suspended' ? 'warning' : 'success'
    );
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast('Please fill in name and email.', 'error');
      return;
    }
    const id = users.length + 1;
    setUsers(prev => [
      { id, ...newUser, status: 'Pending', dateRegistered: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    setNewUser({ name: '', email: '', role: 'Student' });
    setShowAddModal(false);
    showToast(`New user "${newUser.name}" added successfully.`, 'success');
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 },
    controls: { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' },
    tableContainer: { ...commonStyles.dashboardTableContainer },
    table: { ...commonStyles.dashboardTable },
    th: { ...commonStyles.dashboardTableTh },
    td: { ...commonStyles.dashboardTableTd },
    roleBadge: (role) => {
      const colors = {
        Student: { bg: '#E1EFFE', text: '#1E429F' },
        Employer: { bg: '#DEF7EC', text: '#03543F' },
        Coordinator: { bg: '#FEF3C7', text: '#92400E' },
        Supervisor: { bg: '#F3F4F6', text: '#374151' },
        Admin: { bg: '#EBF1FF', text: '#1E40AF' },
        Dean: { bg: '#F3E8FF', text: '#6B21A8' }
      };
      const color = colors[role] || colors.Admin;
      return { ...commonStyles.dashboardBadge, backgroundColor: color.bg, color: color.text };
    },
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      backgroundColor: theme.colors.bgPrimary, borderRadius: '16px',
      padding: '32px', width: '420px', boxShadow: theme.shadows.md,
      display: 'flex', flexDirection: 'column', gap: '16px',
    },
    modalInput: {
      padding: '10px 14px', borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`, fontSize: '0.9rem', outline: 'none', width: '100%',
    },
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Add New User</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input style={styles.modalInput} placeholder="e.g. Maria Santos" value={newUser.name}
                  onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
                <input style={styles.modalInput} placeholder="e.g. maria@school.edu" value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Role</label>
                <select style={styles.modalInput} value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                  {['Student', 'Employer', 'Coordinator', 'Supervisor', 'Dean'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }}
                onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1 }}
                onClick={handleAddUser}>
                <UserPlus size={16} /> Add User
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <button
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={18} /> Add New User
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
          {['All', 'Student', 'Employer', 'Coordinator', 'Supervisor', 'Dean', 'Admin'].map(r => (
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
                      {editingId === user.id ? (
                        <input
                          style={{ border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '2px 8px', fontSize: '0.875rem' }}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleEditSave(user.id)}
                          autoFocus
                        />
                      ) : (
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                      )}
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
                    {editingId === user.id ? (
                      <button
                        title="Save"
                        style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: theme.colors.success, cursor: 'pointer' }}
                        onClick={() => handleEditSave(user.id)}
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        title="Edit name"
                        style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: theme.colors.primary, cursor: 'pointer' }}
                        onClick={() => handleEditStart(user)}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button
                      title={user.status === 'Active' ? 'Suspend user' : 'Reactivate user'}
                      style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}
                      onClick={() => handleToggleSuspend(user.id, user.name, user.status)}
                    >
                      <ShieldAlert size={16} />
                    </button>
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
