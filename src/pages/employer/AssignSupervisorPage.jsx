// src/pages/employer/AssignSupervisorPage.jsx
import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldAlert, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { activeInterns, supervisors } from '../../data/employerMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const AssignSupervisorPage = () => {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [selectedInternId, setSelectedInternId] = useState(activeInterns[0]?.id || '');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredIntern, setHoveredIntern] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const selectedIntern = activeInterns.find(i => i.id === selectedInternId);

  useEffect(() => {
    if (selectedIntern) {
      const currentSup = supervisors.find(s => s.name === selectedIntern.supervisor);
      setSelectedSupervisorId(currentSup ? currentSup.id : '');
    }
  }, [selectedInternId, selectedIntern]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupervisorId) return;
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      if (selectedIntern) {
        const sup = supervisors.find(s => s.id === parseInt(selectedSupervisorId));
        selectedIntern.supervisor = sup ? sup.name : 'Not Assigned'; 
      }
      setTimeout(() => setShowSuccess(false), 3000);
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
      marginBottom: '8px',
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
    content: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '350px 1fr',
      gap: '24px',
      alignItems: 'start',
    },
    sidebar: {
      backgroundColor: theme.colors.white,
      padding: '20px',
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    sidebarTitle: {
      fontSize: '13px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: theme.colors.textMuted,
      marginBottom: '8px',
      marginLeft: '4px',
    },
    internCard: (isSelected, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isSelected ? '#eff6ff' : isHovered ? '#f8fafc' : 'transparent',
      border: `1.5px solid ${isSelected ? theme.colors.primary : 'transparent'}`,
      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none',
    }),
    avatar: (isSelected) => ({
      width: '40px',
      height: '40px',
      borderRadius: '14px',
      backgroundColor: isSelected ? theme.colors.primary : '#f1f5f9',
      color: isSelected ? theme.colors.white : theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: '16px',
      transition: 'all 0.2s',
    }),
    formCard: {
      backgroundColor: theme.colors.white,
      padding: isMobile ? '24px' : '32px',
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
    },
    formHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    positionTag: {
      backgroundColor: '#f1f5f9',
      padding: '6px 14px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    banner: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#fffbeb', // amber-50
      color: '#92400e', // amber-800
      padding: '16px 20px',
      borderRadius: '16px',
      marginBottom: '32px',
      fontSize: '14px',
      fontWeight: 600,
      border: '1px solid #fef3c7',
    },
    label: {
      fontSize: '14px',
      fontWeight: 800,
      color: theme.colors.textMain,
      display: 'block',
      marginBottom: '10px',
      marginLeft: '4px',
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '14px',
      border: `1.5px solid ${theme.colors.border}`,
      fontSize: '15px',
      backgroundColor: '#f8fafc',
      color: theme.colors.textMain,
      outline: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '18px',
    },
    btnPrimary: (isHovered, isDisabled) => ({
      ...commonStyles.buttonPrimary,
      padding: '12px 32px',
      borderRadius: '16px',
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: isHovered && !isDisabled ? theme.colors.primaryDark : theme.colors.primary,
      opacity: isDisabled ? 0.6 : 1,
      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
      marginTop: '24px',
    }),
    successAlert: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '16px',
      padding: '12px 20px',
      color: '#16a34a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontWeight: 700,
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
    }
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={styles.successAlert}>
          <CheckCircle2 size={20} />
          <span>Supervisor assigned successfully!</span>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Assign Supervisors</h1>
        <p style={styles.subtitle}>Coordinate your team by delegating interns to specific oversight leads.</p>
      </div>

      <div style={styles.content}>
        {/* Intern Selection */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>ACTIVE INTERNS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeInterns.map(intern => (
              <div 
                key={intern.id} 
                style={styles.internCard(selectedInternId === intern.id, hoveredIntern === intern.id)}
                onClick={() => setSelectedInternId(intern.id)}
                onMouseEnter={() => setHoveredIntern(intern.id)}
                onMouseLeave={() => setHoveredIntern(null)}
              >
                <div style={styles.avatar(selectedInternId === intern.id)}>
                  {intern.studentName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{intern.studentName}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.colors.textMuted }}>{intern.position}</p>
                </div>
                {selectedInternId === intern.id && <ChevronRight size={16} color={theme.colors.primary} />}
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Form */}
        {selectedIntern && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedIntern.studentName}</h3>
              <span style={styles.positionTag}>{selectedIntern.position}</span>
            </div>

            <div style={styles.banner}>
              <ShieldAlert size={20} />
              <span>
                Currently overseen by: <strong style={{ textDecoration: 'underline' }}>{selectedIntern.supervisor || "Not Assigned"}</strong>
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={styles.label}>Select Department Lead / Supervisor</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={selectedSupervisorId}
                    onChange={(e) => setSelectedSupervisorId(e.target.value)}
                    required
                    style={styles.select}
                  >
                    <option value="" disabled>-- Select from directory --</option>
                    {supervisors.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} — {sup.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  style={styles.btnPrimary(hoveredBtn === 'assign', isSaving)} 
                  disabled={isSaving}
                  onMouseEnter={() => setHoveredBtn('assign')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  <UserPlus size={18} />
                  {isSaving ? 'Processing Assignment...' : 'Finalize Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignSupervisorPage;
