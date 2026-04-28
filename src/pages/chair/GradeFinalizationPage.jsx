import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import Toast from '../../components/common/Toast';

const GradeFinalizationPage = () => {
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [returnModal, setReturnModal] = useState({ isOpen: false, studentId: null, reason: '' });
  const [grades, setGrades] = useState([
    { id: 1, name: 'Alice Smith', coord: '1.25', sup: '4.8/5', status: 'Pending', reason: '' },
    { id: 2, name: 'Bob Jones', coord: '1.50', sup: '4.5/5', status: 'Pending', reason: '' },
    { id: 3, name: 'Charlie Brown', coord: '2.00', sup: '4.0/5', status: 'Approved', reason: '' },
    { id: 4, name: 'Diana Prince', coord: 'Incomplete', sup: '3.5/5', status: 'Returned', reason: 'Missing documents' },
  ]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleApprove = (id) => {
    setGrades(grades.map(g => g.id === id ? { ...g, status: 'Approved' } : g));
    showToast('Grade approved successfully.');
  };

  const handleReturnClick = (id) => {
    setReturnModal({ isOpen: true, studentId: id, reason: '' });
  };

  const submitReturn = () => {
    if (returnModal.reason.trim() === '') {
      showToast('Please provide a reason.', 'error');
      return;
    }
    setGrades(grades.map(g => g.id === returnModal.studentId ? { ...g, status: 'Returned', reason: returnModal.reason } : g));
    showToast('Grade returned to coordinator.', 'warning');
    setReturnModal({ isOpen: false, studentId: null, reason: '' });
  };

  const filteredGrades = grades.filter(g => filter === 'All' ? true : g.status === filter);

  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' },
    subtitle: { color: theme.colors.textMuted, margin: 0 },
    card: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f1f5f9' },
    btnApprove: { padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnReturn: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    filterContainer: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' },
    filterTab: (isActive) => ({
      padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
      backgroundColor: isActive ? theme.colors.primary : '#f1f5f9',
      color: isActive ? '#fff' : theme.colors.textMuted, border: 'none'
    }),
    badge: (status) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
      backgroundColor: status === 'Approved' ? '#DEF7EC' : status === 'Returned' ? '#FEE2E2' : '#FEF3C7',
      color: status === 'Approved' ? '#03543F' : status === 'Returned' ? '#991B1B' : '#92400E',
    }),
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '16px',
      padding: '24px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column',
    },
    textarea: {
      width: '100%', padding: '12px', borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`, fontSize: '0.9rem',
      outline: 'none', resize: 'vertical', minHeight: '100px',
      fontFamily: 'inherit',
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {returnModal.isOpen && (
        <div style={styles.overlay} onClick={() => setReturnModal({ isOpen: false, studentId: null, reason: '' })}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Return Grade</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: theme.colors.textMuted }}>
              Please provide a reason for returning this grade to the coordinator.
            </p>
            <textarea 
              style={styles.textarea}
              placeholder="Enter your reason here..."
              value={returnModal.reason}
              onChange={e => setReturnModal({ ...returnModal, reason: e.target.value })}
              rows={4}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, flex: 1, cursor: 'pointer', backgroundColor: '#fff', fontWeight: 600 }}
                onClick={() => setReturnModal({ isOpen: false, studentId: null, reason: '' })}
              >
                Cancel
              </button>
              <button 
                style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: theme.colors.danger, color: '#fff', flex: 1, cursor: 'pointer', fontWeight: 600 }}
                onClick={submitReturn}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Grade Finalization</h1>
          <p style={styles.subtitle}>Review and approve final grades recommended by OJT Coordinators.</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.filterContainer}>
          <Filter size={18} color={theme.colors.textMuted} />
          {['All', 'Pending', 'Approved', 'Returned'].map(f => (
            <button key={f} style={styles.filterTab(filter === f)} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student Name</th>
              <th style={styles.th}>Coordinator Grade</th>
              <th style={styles.th}>Supervisor Eval</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map(g => (
              <tr key={g.id}>
                <td style={{ ...styles.td, fontWeight: 600 }}>
                  {g.name}
                  {g.reason && g.status === 'Returned' && (
                    <div style={{ fontSize: '0.75rem', color: theme.colors.danger, marginTop: '4px', fontWeight: 'normal' }}>
                      Reason: {g.reason}
                    </div>
                  )}
                </td>
                <td style={styles.td}><span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontWeight: 'bold' }}>{g.coord}</span></td>
                <td style={styles.td}>{g.sup}</td>
                <td style={styles.td}>
                  <span style={styles.badge(g.status)}>{g.status}</span>
                </td>
                <td style={styles.td}>
                  {g.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={styles.btnApprove} onClick={() => handleApprove(g.id)}><CheckCircle size={16} /> Approve</button>
                      <button style={styles.btnReturn} onClick={() => handleReturnClick(g.id)}><XCircle size={16} /> Return</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeFinalizationPage;
