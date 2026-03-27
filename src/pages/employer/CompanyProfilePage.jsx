// src/pages/employer/CompanyProfilePage.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Briefcase, Save, CheckCircle2 } from 'lucide-react';
import { companyProfile } from '../../services/mocks/employerMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState(companyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const styles = {
    container: {
      padding: isMobile ? '0 1.5rem 1.5rem 1.5rem' : '0 2rem 2rem 2rem', // Removed top padding
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    successAlert: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      color: '#16a34a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: 600,
      fontSize: '1rem',
      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
    },
    headerCard: {
      backgroundColor: theme.colors.white,
      padding: isMobile ? '2rem 1.5rem' : '2.5rem',
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      display: 'flex',
      gap: '2rem',
      alignItems: isMobile ? 'center' : 'flex-start',
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: isMobile ? 'center' : 'left',
    },
    logoWrapper: {
      width: '100px',
      height: '100px',
      borderRadius: '24px',
      backgroundColor: theme.colors.bgSecondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1.5px solid ${theme.colors.border}`,
      overflow: 'hidden',
      flexShrink: 0,
    },
    logoImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    headerInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      flex: 1,
    },
    companyName: {
      margin: 0,
      fontSize: '1.75rem',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    industryText: {
      fontSize: '1rem',
      color: theme.colors.primary,
      fontWeight: 700,
      margin: 0,
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.9rem',
      color: theme.colors.textMuted,
      justifyContent: isMobile ? 'center' : 'flex-start',
    },
    websiteLink: {
      color: theme.colors.primary,
      textDecoration: 'none',
      fontWeight: 600,
    },
    formCard: {
      backgroundColor: theme.colors.white,
      padding: isMobile ? '1.5rem' : '2.5rem',
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
    },
    formTitle: {
      margin: '0 0 2rem',
      fontSize: '1.25rem',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    form: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '1.5rem',
    },
    formGroup: (fullWidth) => ({
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      gridColumn: fullWidth && !isMobile ? '1 / span 2' : 'span 1',
    }),
    label: {
      fontSize: '0.875rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginLeft: '4px',
    },
    input: (isFocused) => ({
      padding: '0.875rem 1.125rem',
      borderRadius: '14px',
      border: `1.5px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
      fontSize: '0.95rem',
      color: theme.colors.textMain,
      backgroundColor: isFocused ? '#fff' : '#f8fafc',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isFocused ? `0 0 0 4px ${theme.colors.primary}15` : 'none',
    }),
    textarea: (isFocused) => ({
      padding: '1rem 1.125rem',
      borderRadius: '16px',
      border: `1.5px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
      fontSize: '0.95rem',
      color: theme.colors.textMain,
      backgroundColor: isFocused ? '#fff' : '#f8fafc',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      minHeight: '150px',
      resize: 'vertical',
      boxShadow: isFocused ? `0 0 0 4px ${theme.colors.primary}15` : 'none',
    }),
    actions: {
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1rem',
      paddingTop: '2rem',
      borderTop: `1px solid ${theme.colors.border}`,
    },
    saveBtn: (isHovered, disabled) => ({
      ...commonStyles.buttonPrimary,
      padding: '1rem 2.5rem',
      borderRadius: '16px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: isHovered && !disabled ? theme.colors.primaryDark : theme.colors.primary,
      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
    })
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={styles.successAlert}>
          <CheckCircle2 size={24} />
          <span>Changes saved successfully!</span>
        </div>
      )}

      <div style={styles.headerCard}>
        <div style={styles.logoWrapper}>
          {profile.logo ? (
            <img src={profile.logo} alt="Logo" style={styles.logoImg} />
          ) : (
            <Briefcase size={48} color={theme.colors.primary} />
          )}
        </div>
        <div style={styles.headerInfo}>
          <h1 style={styles.companyName}>{profile.name}</h1>
          <p style={styles.industryText}>{profile.industry}</p>
          <div style={styles.metaRow}>
            <MapPin size={16} /> <span>{profile.address}</span>
          </div>
          <div style={styles.metaRow}>
            <Globe size={16} /> 
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noreferrer" 
              style={styles.websiteLink}
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Company Settings</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup(false)}>
            <label style={styles.label}><Mail size={16} /> Email Address</label>
            <input 
              style={styles.input(focusedField === 'email')}
              type="email" 
              name="email" 
              value={profile.email} 
              onChange={handleChange} 
              required 
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div style={styles.formGroup(false)}>
            <label style={styles.label}><Phone size={16} /> Contact Number</label>
            <input 
              style={styles.input(focusedField === 'contactNumber')}
              type="text" 
              name="contactNumber" 
              value={profile.contactNumber} 
              onChange={handleChange} 
              required 
              onFocus={() => setFocusedField('contactNumber')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div style={styles.formGroup(true)}>
            <label style={styles.label}>Company Description</label>
            <textarea 
              style={styles.textarea(focusedField === 'description')}
              name="description" 
              value={profile.description} 
              onChange={handleChange} 
              rows="5" 
              required 
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div style={styles.actions}>
            <button 
              type="submit" 
              style={styles.saveBtn(hoveredBtn === 'save', isSaving)} 
              disabled={isSaving}
              onMouseEnter={() => setHoveredBtn('save')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              <Save size={20} />
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
