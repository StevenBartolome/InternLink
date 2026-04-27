import React, { useState } from 'react';
import { 
  Users, Search,
  UserPlus, ShieldAlert, Edit, X, Save, Check
} from 'lucide-react';
import { theme } from '../../styles/theme';
import Toast from '../../components/common/Toast';

const ChairManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', program: 'BS Information Technology' });
  
  const [chairs, setChairs] = useState([
    { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah.wilson@school.edu', program: 'BS Information Technology', status: 'Active', dateJoined: '2023-09-01' },
    { id: 2, name: 'Dr. Michael Chen', email: 'michael.chen@school.edu', program: 'BS Computer Science', status: 'Active', dateJoined: '2023-09-05' },
  ]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleAddChair = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast('Please fill in name and email.', 'error');
      return;
    }
    const id = chairs.length + 1;
    setChairs(prev => [
      { id, ...newUser, status: 'Pending', dateJoined: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    setNewUser({ name: '', email: '', program: 'BS Information Technology' });
    setShowAddModal(false);
    showToast(`Invitation sent to "${newUser.name}".`, 'success');
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
      backgroundColor: status === 'Active' ? '#DEF7EC' : '#FEF3C7',
      color: status === 'Active' ? '#03543F' : '#92400E',
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
      padding: '10px 20px', backgroundColor: '#6B21A8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Invite Program Chair</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input style={styles.modalInput} placeholder="e.g. Dr. Jane Doe" value={newUser.name}
                  onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
                <input style={styles.modalInput} placeholder="e.g. jane@school.edu" value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Program</label>
                <select style={styles.modalInput} value={newUser.program}
                  onChange={e => setNewUser(p => ({ ...p, program: e.target.value }))}>
                  <option>BS Information Technology</option>
                  <option>BS Computer Science</option>
                  <option>BS Information Systems</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, flex: 1, cursor: 'pointer' }}
                onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={{ ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}
                onClick={handleAddChair}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>Program Chair Management</h1>
        <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Invite New Chair
        </button>
      </header>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Chair</th>
              <th style={styles.th}>Program</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date Joined</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chairs.map(chair => (
              <tr key={chair.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{chair.name}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{chair.email}</div>
                </td>
                <td style={styles.td}>{chair.program}</td>
                <td style={styles.td}>
                  <span style={styles.badge(chair.status)}>{chair.status}</span>
                </td>
                <td style={styles.td}>{chair.dateJoined}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px', background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer' }}><Edit size={16} /></button>
                    <button style={{ padding: '6px', background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}><ShieldAlert size={16} /></button>
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

export default ChairManagementPage;
