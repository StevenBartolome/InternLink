import React from 'react';
import { 
  Building2, MapPin, Clock, 
  Briefcase, Send, ChevronLeft,
  Calendar, ShieldCheck, Globe,
  CheckCircle, Star, MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const InternshipDetailPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  // Mock listing if data not found
  const listing = {
    id: 1,
    title: 'Frontend Development Intern',
    company: 'Google Philippines',
    location: 'Taguig, Metro Manila',
    type: 'Full-time Hybrid',
    duration: '480 Hours',
    stipend: '₱15,000 - ₱20,000 / month',
    postedDate: 'Oct 15, 2023',
    description: 'We are looking for passionate students to join our frontend engineering team. You will work on real-world projects using React, TypeScript, and modern web technologies.',
    requirements: [
      'Currently enrolled in BSCS, BSIT or related courses',
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with React is a plus',
      'Strong problem-solving skills'
    ],
    benefits: [
      'Mentorship from senior engineers',
      'Exposure to Google-scale projects',
      'OJT Certificate upon completion',
      'Free lunch and snacks'
    ]
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    backLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.textMuted,
      fontSize: '0.9rem',
      cursor: 'pointer',
      marginBottom: '8px',
    },
    hero: {
      ...commonStyles.dashboardCard,
      padding: '40px',
      background: theme.gradients.primary,
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '24px',
    },
    contentLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '24px',
    },
    section: {
      ...commonStyles.dashboardCard,
      padding: '32px',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1rem',
      color: 'rgba(255,255,255,0.9)',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backLink} onClick={() => navigate(-1)}>
        <ChevronLeft size={18} /> Back to Search
      </div>

      <div style={styles.hero}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>New Posting</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>Verified</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 12px 0' }}>{listing.title}</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={styles.infoRow}><Building2 size={20} /> {listing.company}</div>
            <div style={styles.infoRow}><MapPin size={20} /> {listing.location}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{listing.stipend}</div>
          <button 
            style={{ ...commonStyles.dashboardBtn, backgroundColor: theme.colors.white, color: theme.colors.primary, padding: '14px 40px', fontSize: '1rem', fontWeight: 800 }}
            onClick={() => navigate(`/apply/${listing.id}`)}
          >
            Apply Now
          </button>
        </div>
      </div>

      <div style={styles.contentLayout}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>About the Role</h3>
            <p style={{ lineHeight: 1.6, color: theme.colors.textDark }}>{listing.description}</p>
          </div>
          <div style={styles.section}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Minimum Requirements</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
              {listing.requirements.map((req, i) => (
                <li key={i} style={{ color: theme.colors.textDark }}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Job Snapshot</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Clock size={18} color={theme.colors.primary} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>OJT Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{listing.duration}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Briefcase size={18} color={theme.colors.primary} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Job Type</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{listing.type}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Calendar size={18} color={theme.colors.primary} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Date Posted</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{listing.postedDate}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...styles.section, background: theme.colors.bgAccent }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: theme.colors.primary, marginBottom: '12px' }}>
              <Star size={20} fill={theme.colors.primary} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Company Benefits</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listing.benefits.map((ben, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: theme.colors.textDark }}>
                  <CheckCircle size={16} color={theme.colors.success} /> {ben}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
