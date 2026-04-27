// src/pages/dean/ProfilePage.jsx
import React from 'react';
import { Mail, Phone, MapPin, Building, Award, GraduationCap } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { deanProfile } from '../../services/mocks/coordinatorMockData';

const ProfilePage = () => {
  const styles = {
    container: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' },
    card: { ...commonStyles.dashboardCard, padding: '40px' },
    header: { display: 'flex', gap: '32px', alignItems: 'center' },
    avatar: { width: '120px', height: '120px', borderRadius: '30px', objectFit: 'cover', border: `4px solid ${theme.colors.bgSecondary}` },
    name: { fontSize: '2.25rem', fontWeight: 800, color: theme.colors.textMain, margin: '0 0 8px 0' },
    roleBadge: { padding: '6px 16px', backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary, borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: theme.colors.bgSecondary, borderRadius: '20px' },
    iconBox: { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src={deanProfile.avatar} alt="Dean Avatar" style={styles.avatar} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <h1 style={styles.name}>{deanProfile.name}</h1>
              <span style={styles.roleBadge}>{deanProfile.role}</span>
            </div>
            <p style={{ color: theme.colors.textMuted, fontSize: '1.1rem', maxWidth: '600px', margin: 0 }}>{deanProfile.bio}</p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.infoItem}>
          <div style={styles.iconBox}><Building size={20} /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Academic Unit</div>
            <div style={{ fontWeight: 700, color: theme.colors.textMain }}>{deanProfile.college}</div>
          </div>
        </div>
        <div style={styles.infoItem}>
          <div style={styles.iconBox}><Mail size={20} /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Email Address</div>
            <div style={{ fontWeight: 700, color: theme.colors.textMain }}>{deanProfile.email}</div>
          </div>
        </div>
        <div style={styles.infoItem}>
          <div style={styles.iconBox}><Phone size={20} /></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Contact Number</div>
            <div style={{ fontWeight: 700, color: theme.colors.textMain }}>{deanProfile.phone}</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.colors.primary }}>{deanProfile.stats.totalPrograms}</div>
          <div style={{ color: theme.colors.textMuted, fontWeight: 700 }}>Academic Programs</div>
        </div>
        <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.colors.success }}>{deanProfile.stats.activePartnerships}</div>
          <div style={{ color: theme.colors.textMuted, fontWeight: 700 }}>Active Partnerships</div>
        </div>
        <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.colors.secondary }}>{deanProfile.stats.facultyCount}</div>
          <div style={{ color: theme.colors.textMuted, fontWeight: 700 }}>Total Faculty</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
