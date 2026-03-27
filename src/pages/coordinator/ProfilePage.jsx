import React from 'react';
import { 
  User, Mail, Phone, MapPin, 
  Building, GraduationCap, Award, 
  Key, Shield, LogOut, Camera
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { coordinatorProfile } from '../../data/coordinatorMockData';

const ProfilePage = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '800px',
      margin: '0 auto',
    },
    profileHeader: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '40px',
      background: theme.gradients.primary,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    avatarWrapper: {
      position: 'relative',
      zIndex: 2,
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '30px',
      border: '4px solid rgba(255,255,255,0.2)',
      objectFit: 'cover',
    },
    cameraBtn: {
      position: 'absolute',
      bottom: '-8px',
      right: '-8px',
      backgroundColor: theme.colors.white,
      color: theme.colors.primary,
      padding: '8px',
      borderRadius: '50%',
      boxShadow: theme.shadows.md,
      cursor: 'pointer',
      border: 'none',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
    },
    infoCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.profileHeader}>
        <div style={styles.avatarWrapper}>
          <img src={coordinatorProfile.avatar} alt="Profile" style={styles.avatar} />
          <button style={styles.cameraBtn}><Camera size={18} /></button>
        </div>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>{coordinatorProfile.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
            <GraduationCap size={18} />
            <span>{coordinatorProfile.role} • {coordinatorProfile.department}</span>
          </div>
        </div>
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Contact Information</h3>
          <div style={styles.detailItem}>
            <div style={styles.iconBox}><Mail size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Email Address</div>
              <div style={{ fontWeight: 600 }}>{coordinatorProfile.email}</div>
            </div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.iconBox}><Building size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Affiliation</div>
              <div style={{ fontWeight: 600 }}>{coordinatorProfile.school}</div>
            </div>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Account Security</h3>
          <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, justifyContent: 'flex-start' }}>
            <Key size={18} />
            Change Password
          </button>
          <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, justifyContent: 'flex-start' }}>
            <Shield size={18} />
            Two-Factor Authentication
          </button>
        </div>
      </div>

      <div style={{ ...styles.infoCard, alignItems: 'center', padding: '32px' }}>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '24px' }}>
          Your profile information is visible to students and employers within the National University Baliwag network.
        </p>
        <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, width: '200px' }}>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
