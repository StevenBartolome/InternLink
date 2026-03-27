import React, { useState } from 'react';
import { adminProfile } from '../../services/mocks/adminMockData';
import { Shield, Edit2, ShieldCheck, Save, X } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import Toast from '../../components/common/Toast';

const AdminProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    email: adminProfile.email,
    systemName: adminProfile.systemName,
    name: adminProfile.name,
  });
  const [formData, setFormData] = useState({ ...profile });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel — reset form
      setFormData({ ...profile });
    }
    setIsEditing(prev => !prev);
  };

  const handleSave = () => {
    setProfile({ ...formData });
    setIsEditing(false);
    showToast('Profile details updated successfully.', 'success');
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '900px',
    },
    header: {
      ...commonStyles.dashboardCard,
      padding: '40px',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)',
    },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '24px',
      backgroundColor: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      boxShadow: theme.shadows.md,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
    },
    section: {
      ...commonStyles.dashboardCard,
      padding: '24px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.colors.bgSecondary}`,
    },
    input: {
      padding: '6px 10px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '0.9rem',
      outline: 'none',
      fontWeight: 600,
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.header}>
        <div style={styles.avatar}>
          <Shield size={48} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isEditing ? (
              <input
                style={{ ...styles.input, fontSize: '1.5rem', fontWeight: 800 }}
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              />
            ) : (
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{profile.name}</h1>
            )}
            <ShieldCheck size={20} color={theme.colors.success} />
          </div>
          <p style={{ color: theme.colors.textMuted, margin: '4px 0 16px 0' }}>{adminProfile.role} • System Administrator</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
              onClick={handleEditToggle}
            >
              {isEditing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Details</>}
            </button>
            {isEditing && (
              <button
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
                onClick={handleSave}
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.section}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Admin Credentials</h3>
          <div style={styles.infoRow}>
            <span style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>Email Address</span>
            {isEditing ? (
              <input
                style={styles.input}
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
              />
            ) : (
              <span style={{ fontWeight: 600 }}>{profile.email}</span>
            )}
          </div>
          <div style={styles.infoRow}>
            <span style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>System Node</span>
            {isEditing ? (
              <input
                style={styles.input}
                value={formData.systemName}
                onChange={e => setFormData(f => ({ ...f, systemName: e.target.value }))}
              />
            ) : (
              <span style={{ fontWeight: 600 }}>{profile.systemName}</span>
            )}
          </div>
          <div style={styles.infoRow}>
            <span style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>Account Level</span>
            <span style={{ fontWeight: 600, color: theme.colors.primary }}>Root ACCESS</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Security Modules</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['System Integrity', 'User Audit', 'Global Broadcast', 'Secure Matching'].map(tag => (
              <span key={tag} style={{ ...commonStyles.dashboardBadge, backgroundColor: theme.colors.bgAccent, color: theme.colors.primary }}>{tag}</span>
            ))}
          </div>
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: theme.colors.bgSecondary, borderRadius: '12px', fontSize: '0.8rem', color: theme.colors.textMuted }}>
            Your account has full read/write access to the core InternLink engine and all its sub-modules.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
