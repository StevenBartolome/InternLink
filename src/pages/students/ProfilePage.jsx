import React from 'react';
import { 
  User, Mail, Phone, MapPin, 
  Calendar, GraduationCap, Edit,
  ShieldCheck, ExternalLink, Github,
  FileText, Award, Star
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { studentProfile } from '../../data/mockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ProfilePage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    headerCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: '32px',
      padding: '40px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: `4px solid ${theme.colors.bgAccent}`,
      boxShadow: theme.shadows.md,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      gap: '24px',
    },
    section: {
      ...commonStyles.dashboardCard,
      padding: '24px',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.colors.bgSecondary}`,
    },
    badge: {
      ...commonStyles.dashboardBadge,
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      margin: '4px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <img src={studentProfile.avatar} alt={studentProfile.name} style={styles.avatar} />
        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{studentProfile.name}</h1>
            <ShieldCheck size={20} color={theme.colors.success} />
          </div>
          <p style={{ color: theme.colors.textMuted, fontSize: '1rem', margin: '4px 0 16px 0' }}>{studentProfile.course}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
              <Edit size={16} /> Edit Profile
            </button>
            <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>
              <ExternalLink size={16} /> View Public Link
            </button>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Contact Information</h3>
            <div style={styles.infoItem}><Mail size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>{studentProfile.email}</span></div>
            <div style={styles.infoItem}><Phone size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>{studentProfile.contact}</span></div>
            <div style={styles.infoItem}><MapPin size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>{studentProfile.address}</span></div>
            <div style={styles.infoItem}><Calendar size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>Joined March 2024</span></div>
          </div>

          <div style={styles.section}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Social & Portfolio</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {studentProfile.portfolioLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.primary, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                  {link.url.includes('github') ? <Github size={18} /> : <ExternalLink size={18} />}
                  {link.url.replace('https://', '')}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700 }}>Technical Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {studentProfile.skills.map((skill, i) => (
                <span key={i} style={styles.badge}>{skill}</span>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700 }}>Certifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {studentProfile.certifications.map(cert => (
                <div key={cert.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: theme.colors.bgAccent, padding: '10px', borderRadius: '10px', color: theme.colors.primary }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cert.title}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{cert.issuer} • {cert.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
