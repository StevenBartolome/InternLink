import React, { useState } from 'react';
import { 
  Users, Search,
  UserPlus, ShieldAlert, Edit, X, Save, Check
} from 'lucide-react';
import { theme } from '../../styles/theme';
import Toast from '../../components/common/Toast';
import Modal from '../../components/common/Modal/Modal';

const CoordinatorManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, coordinatorId: null });
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  
  const [coordinators, setCoordinators] = useState([
    { id: 1, name: 'Prof. David Miller', email: 'david.miller@school.edu', status: 'Active', load: '45 Students' },
    { id: 2, name: 'Prof. Elena Rodriguez', email: 'elena.r@school.edu', status: 'Active', load: '38 Students' },
  ]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleAddCoordinator = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast('Please fill in name and email.', 'error');
      return;
    }
    const id = coordinators.length + 1;
    setCoordinators(prev => [
      { id, ...newUser, status: 'Pending', load: '0 Students' },
      ...prev
    ]);
    setNewUser({ name: '', email: '' });
    setShowAddModal(false);
    showToast(`Coordinator "${newUser.name}" invited successfully.`, 'success');
  };

  const handleEdit = (id) => {
    showToast(`Edit functionality mock for Coordinator ID ${id}`, 'info');
  };

  const handleDeactivate = (id) => {
    setConfirmModal({ isOpen: true, coordinatorId: id });
  };

  const confirmDeactivate = () => {
    setCoordinators(prev => prev.map(c => {
      if (c.id === confirmModal.coordinatorId) {
        return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return c;
    }));
    showToast('Coordinator status updated.', 'success');
    setConfirmModal({ isOpen: false, coordinatorId: null });
  };

  const styles = {
    container: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 },
    card: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: `2px solid ${theme.colors.border}`, color: theme.colors.textMuted, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' },
    td: { padding: '16px 12px', borderBottom: `1px solid ${theme.colors.border}`, fontSize: '0.9rem' },
    badge: (status) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
      backgroundColor: status === 'Active' ? '#DEF7EC' : status === 'Inactive' ? '#FEE2E2' : '#FEF3C7',
      color: status === 'Active' ? '#03543F' : status === 'Inactive' ? '#991B1B' : '#92400E',
    }),
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '16px',
      padding: '32px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', gap: '16px',
    },
    modalInput: {
      padding: '10px 14px', borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`, fontSize: '0.9rem', outline: 'none', width: '100%',
    },
    btnPrimary: {
      padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, coordinatorId: null })} 
        isConfirm={true}
        onConfirm={confirmDeactivate}
        title="Confirm Status Change" 
        message="Are you sure you want to change the status of this coordinator?" 
        type="warning" 
      />

      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Invite OJT Coordinator</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input style={styles.modalInput} placeholder="e.g. Prof. John Smith" value={newUser.name}
                  onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
                <input style={styles.modalInput} placeholder="e.g. john.smith@school.edu" value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, flex: 1, cursor: 'pointer' }}
                onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={{ ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}
                onClick={handleAddCoordinator}>
                Add Coordinator
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>OJT Coordinator Management</h1>
        <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Add New Coordinator
        </button>
      </header>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Coordinator</th>
              <th style={styles.th}>Student Load</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coordinators.map(coord => (
              <tr key={coord.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{coord.name}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{coord.email}</div>
                </td>
                <td style={styles.td}>{coord.load}</td>
                <td style={styles.td}>
                  <span style={styles.badge(coord.status)}>{coord.status}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(coord.id)} style={{ padding: '6px', background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer' }}><Edit size={16} /></button>
                    <button onClick={() => handleDeactivate(coord.id)} style={{ padding: '6px', background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}><ShieldAlert size={16} /></button>
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

export default CoordinatorManagementPage;
