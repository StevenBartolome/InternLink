// src/pages/supervisor/ProfilePage.jsx
import React, { useState } from 'react';
import { User, Mail, Building, Phone, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { supervisorData } from '../../services/mocks/supervisorMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ProfilePage = () => {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [formData, setFormData] = useState({
    name: supervisorData.name,
    email: supervisorData.email || 'supervisor@gmail.com',
    department: supervisorData.department,
    phone: supervisorData.phone || '+63 912 345 6789',
    employeeId: supervisorData.employeeId || 'SUP-2026-0042',
    joinDate: supervisorData.joinDate || 'Jan 2025'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      supervisorData.name = formData.name;
      supervisorData.department = formData.department;
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
    alert: {
      backgroundColor: '#dcfce7',
      color: '#16a34a',
      padding: '16px 20px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: 700,
      border: '1px solid #bbf7d0',
      marginBottom: '8px',
    },
    header: {
      marginBottom: '8px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: theme.colors.textMuted,
      marginTop: '4px',
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
      gap: '24px',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: '24px',
    },
    avatarWrapper: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `4px solid ${theme.colors.white}`,
      boxShadow: theme.shadows.md,
    },
    profileName: {
      fontSize: '18px',
      fontWeight: 800,
      color: theme.colors.textMain,
      textAlign: 'center',
      margin: '0 0 4px 0',
    },
    profileRole: {
      fontSize: '14px',
      color: theme.colors.primary,
      fontWeight: 700,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '16px',
    },
    profileStat: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '13px',
      color: theme.colors.textMuted,
      fontWeight: 600,
      padding: '8px',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '12px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.colors.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.bgSecondary,
      fontWeight: 500,
      transition: 'all 0.2s',
      ':focus': { border: `1px solid ${theme.colors.primary}`, outline: 'none' }
    },
    inputReadonly: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      cursor: 'not-allowed',
    },
    helpText: {
      fontSize: '11px',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      marginLeft: '4px',
    },
    saveBtnContainer: {
      display: 'flex',
      justifyContent: isMobile ? 'stretch' : 'flex-end',
      marginTop: '12px',
    },
    saveBtn: {
      ...commonStyles.buttonPrimary,
      padding: '14px 32px',
      borderRadius: '14px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      width: isMobile ? '100%' : 'fit-content',
    }
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={styles.alert}>
          <CheckCircle2 size={18} /> Profile updated successfully!
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.title}>My Profile</h2>
        <p style={styles.subtitle}>View and update your supervisor account details</p>
      </div>

      <div style={styles.layout}>
        {/* Left: Avatar Card */}
        <div style={styles.card}>
          <div style={styles.avatarWrapper}>
            <img src={supervisorData.avatar} alt={formData.name} style={styles.avatar} />
          </div>
          <h3 style={styles.profileName}>{formData.name}</h3>
          <p style={styles.profileRole}>{supervisorData.role}</p>
          <div style={styles.profileStat}>
            <Building size={16} />
            <span>{formData.department}</span>
          </div>
        </div>

        {/* Right: Form Card */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 24px 0' }}>Account Information</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}><User size={16} /> Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><Mail size={16} /> Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><Building size={16} /> Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><Phone size={16} /> Contact Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><User size={16} /> Employee ID</label>
                <input 
                  type="text" 
                  value={formData.employeeId} 
                  disabled 
                  style={{ ...styles.input, ...styles.inputReadonly }}
                />
                <span style={styles.helpText}>Read-only field</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><Calendar size={16} /> Joined</label>
                <input 
                  type="text" 
                  value={formData.joinDate} 
                  disabled 
                  style={{ ...styles.input, ...styles.inputReadonly }}
                />
                <span style={styles.helpText}>Read-only field</span>
              </div>
            </div>

            <div style={styles.saveBtnContainer}>
              <button type="submit" style={styles.saveBtn} disabled={isSaving}>
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
