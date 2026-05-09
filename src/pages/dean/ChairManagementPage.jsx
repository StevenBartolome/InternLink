// src/pages/dean/ChairManagementPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, Search,
  UserPlus, ShieldAlert, Edit, X, Save, Check, Mail, Building
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import Modal from '../../components/common/Modal/Modal';

const ChairManagementPage = () => {
  const { showToast } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', program: 'BS Information Technology' });

  const [chairs, setChairs] = useState([
    { id: 1, name: 'Prof. Erick Campano', email: 'sarah.wilson@school.edu', program: 'BS Information Technology', status: 'Active', dateJoined: '2023-09-01' },
    { id: 2, name: 'Prof. Jake Moral', email: 'michael.chen@school.edu', program: 'BS Computer Engineering', status: 'Active', dateJoined: '2023-09-05' },
    { id: 3, name: 'Engr. Manny', email: 'john.doe@school.edu', program: 'BS Civil Engineering', status: 'Pending', dateJoined: '2024-01-15' },
  ]);

  const handleAddChair = (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast && showToast('Please fill in name and email.', 'error');
      return;
    }
    const id = chairs.length + 1;
    setChairs(prev => [
      { id, ...newUser, status: 'Pending', dateJoined: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    setNewUser({ name: '', email: '', program: 'BS Information Technology' });
    setShowAddModal(false);
    showToast && showToast(`Invitation sent to "${newUser.name}".`, 'success');
  };

  const handleAction = (chair, type) => {
    if (type === 'edit') {
      showToast && showToast(`Editing profile for ${chair.name}...`, 'info');
    } else if (type === 'deactivate') {
      setSelectedChair(chair);
      setIsConfirmModalOpen(true);
    }
  };

  const confirmDeactivate = () => {
    setChairs(prev => prev.map(c => c.id === selectedChair.id ? { ...c, status: 'Inactive' } : c));
    setIsConfirmModalOpen(false);
    showToast && showToast(`Program chair ${selectedChair.name} has been deactivated.`, 'warning');
  };

  const styles = {
    container: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain, margin: 0 },
    card: { backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '16px', borderBottom: `2px solid #f1f5f9`, color: theme.colors.textMuted, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' },
    td: { padding: '20px 16px', borderBottom: `1px solid #f1f5f9`, fontSize: '0.95rem' },
    badge: (status) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
      backgroundColor: status === 'Active' ? '#d1fae5' : (status === 'Inactive' ? '#fee2e2' : '#fef3c7'),
      color: status === 'Active' ? '#065f46' : (status === 'Inactive' ? '#991b1b' : '#92400e'),
    }),
    btnPrimary: {
      padding: '12px 24px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
    },
    actionBtn: (color) => ({
      padding: '8px', borderRadius: '10px', border: 'none', background: `${color}15`, color: color, cursor: 'pointer', transition: 'all 0.2s'
    }),
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '24px',
      padding: '32px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #f1f5f9'
    },
    modalInput: {
      padding: '12px 16px',
      paddingLeft: '44px',
      borderRadius: '14px',
      border: `2px solid ${theme.colors.bgSecondary}`,
      fontSize: '0.95rem',
      outline: 'none',
      width: '100%',
      backgroundColor: theme.colors.bgSecondary,
      transition: 'all 0.2s ease',
      color: theme.colors.textMain,
      fontWeight: 500,
      fontFamily: 'inherit',
    },
  };

  return (
    <div style={styles.container}>
      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: theme.colors.textMain }}>Invite Program Chair</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }} onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddChair} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.colors.textMain, display: 'block', marginBottom: '10px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <Users size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.primary }} />
                  <input
                    style={styles.modalInput}
                    placeholder="e.g. Dr. Jane Doe"
                    value={newUser.name}
                    onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.colors.textMain, display: 'block', marginBottom: '10px' }}>Institutional Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.primary }} />
                  <input
                    style={styles.modalInput}
                    type="email"
                    placeholder="e.g. jane@school.edu"
                    value={newUser.email}
                    onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.colors.textMain, display: 'block', marginBottom: '10px' }}>Academic Program</label>
                <div style={{ position: 'relative' }}>
                  <Building size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.primary }} />
                  <select
                    style={styles.modalInput}
                    value={newUser.program}
                    onChange={e => setNewUser(p => ({ ...p, program: e.target.value }))}
                  >
                    <option>BS Information Technology</option>
                    <option>BS Computer Science</option>
                    <option>BS Civil Engineering</option>
                    <option>BS Business Administration</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" style={{ ...commonStyles.dashboardBtnSecondary, flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" style={{ ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}>Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        isConfirm={true}
        onConfirm={confirmDeactivate}
        title="Deactivate Account"
        message={`Are you sure you want to deactivate the account for ${selectedChair?.name}? They will lose access to the portal.`}
        type="danger"
      />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Program Chair Management</h1>
          <p style={{ color: theme.colors.textMuted, margin: '4px 0 0 0' }}>Manage access and roles for department heads.</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Invite New Chair
        </button>
      </header>

      <div style={styles.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Chair Details</th>
                <th style={styles.th}>Academic Program</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chairs.map(chair => (
                <tr key={chair.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 800, color: theme.colors.textMain }}>{chair.name}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{chair.email}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600 }}>{chair.program}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(chair.status)}>{chair.status}</span>
                  </td>
                  <td style={styles.td}>{chair.dateJoined}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        style={styles.actionBtn(theme.colors.primary)}
                        title="Edit Chair"
                        onClick={() => handleAction(chair, 'edit')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={styles.actionBtn(theme.colors.danger)}
                        title="Deactivate Chair"
                        onClick={() => handleAction(chair, 'deactivate')}
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
    </div>
  );
};

export default ChairManagementPage;
