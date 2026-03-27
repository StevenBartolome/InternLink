// src/pages/employer/ManageSupervisorsPage.jsx
import React, { useState } from 'react';
import { Users, UserPlus, Mail, Building, ShieldCheck, Plus, X, User } from 'lucide-react';
import { supervisors as initialSupervisors } from '../../services/mocks/employerMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ManageSupervisorsPage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [supervisorsList, setSupervisorsList] = useState(initialSupervisors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupervisor(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      const createdSupervisor = {
        id: supervisorsList.length + 1,
        ...newSupervisor
      };

      setSupervisorsList([...supervisorsList, createdSupervisor]);
      initialSupervisors.push(createdSupervisor);

      setIsSaving(false);
      setIsModalOpen(false);
      setNewSupervisor({ name: '', email: '', department: '' });
    }, 1000);
  };

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    title: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: '14px',
      margin: 0,
    },
    btnAdd: (isHovered) => ({
      ...commonStyles.buttonPrimary,
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: isHovered ? theme.colors.primaryDark : theme.colors.primary,
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
      cursor: 'pointer',
      border: 'none',
    }),
    tableCard: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
    },
    th: {
      padding: '16px 24px',
      fontSize: '12px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.75px',
      color: theme.colors.textMuted,
      backgroundColor: '#f8fafc',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    td: {
      padding: '16px 24px',
      fontSize: '14px',
      color: theme.colors.textMain,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    nameCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: 700,
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '12px',
      backgroundColor: '#eff6ff',
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 800,
      border: '1.5px solid rgba(59, 130, 246, 0.1)',
    },
    deptTag: {
      backgroundColor: '#f1f5f9',
      color: theme.colors.textMuted,
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
    },
    statusBadge: {
      backgroundColor: '#dcfce7',
      color: '#16a34a',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      backgroundColor: theme.colors.white,
      width: '100%',
      maxWidth: '480px',
      borderRadius: '28px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '32px',
      position: 'relative',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '20px',
    },
    label: {
      fontSize: '13px',
      fontWeight: 800,
      color: theme.colors.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    input: (isFocused) => ({
      padding: '12px 16px',
      borderRadius: '14px',
      border: `1.5px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
      fontSize: '15px',
      backgroundColor: isFocused ? '#fff' : '#f8fafc',
      outline: 'none',
      transition: 'all 0.2s',
      boxShadow: isFocused ? `0 0 0 4px ${theme.colors.primary}15` : 'none',
    }),
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '12px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Supervisors</h1>
          <p style={styles.subtitle}>Empower your team leads with administrative oversight of student interns.</p>
        </div>
        <button 
          style={styles.btnAdd(hoveredBtn === 'add')} 
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setHoveredBtn('add')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          <UserPlus size={18} /> Register Supervisor
        </button>
      </div>

      <div style={styles.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Contact Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>System Status</th>
              </tr>
            </thead>
            <tbody>
              {supervisorsList.map(sup => (
                <tr 
                  key={sup.id}
                  onMouseEnter={() => setHoveredRow(sup.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ backgroundColor: hoveredRow === sup.id ? '#f8fafc' : 'transparent', transition: 'background-color 0.2s' }}
                >
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>{sup.name.charAt(0)}</div>
                      <span>{sup.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{sup.email || '—'}</td>
                  <td style={styles.td}>
                    <span style={styles.deptTag}>{sup.department}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge}>System Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>New Supervisor</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ ...commonStyles.buttonSecondary, padding: '4px', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={24} color={theme.colors.textMuted} />
              </button>
            </div>
            
            <form onSubmit={handleRegister}>
              <div style={styles.formGroup}>
                <label style={styles.label}><User size={14} /> FULL NAME</label>
                <input 
                  type="text" 
                  name="name" 
                  style={styles.input(focusedField === 'name')}
                  value={newSupervisor.name} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Juan Perez"
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><Mail size={14} /> EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  name="email" 
                  style={styles.input(focusedField === 'email')}
                  value={newSupervisor.email} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@company.com"
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><Building size={14} /> ASSIGNED DEPARTMENT</label>
                <input 
                  type="text" 
                  name="department" 
                  style={styles.input(focusedField === 'dept')}
                  value={newSupervisor.department} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('dept')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Software Engineering"
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><ShieldCheck size={14} /> SYSTEM PERMISSIONS</label>
                <input 
                  type="text" 
                  value="Standard Supervisor Access" 
                  disabled 
                  style={{ ...styles.input(false), backgroundColor: '#f1f5f9', color: theme.colors.textMuted, cursor: 'not-allowed' }} 
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  style={{ ...commonStyles.buttonSecondary, border: 'none', cursor: 'pointer' }} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ ...styles.btnAdd(hoveredBtn === 'reg'), minWidth: '120px', justifyContent: 'center', cursor: 'pointer' }} 
                  disabled={isSaving}
                  onMouseEnter={() => setHoveredBtn('reg')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {isSaving ? 'Registering...' : 'Register Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSupervisorsPage;
