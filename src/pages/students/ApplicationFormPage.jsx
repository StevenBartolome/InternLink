import React, { useState } from 'react';
import { 
  Send, FileText, ChevronLeft, 
  AlertCircle, CheckCircle, Upload,
  Info, Briefcase, Building2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

const ApplicationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock data for the specific internship
  const listing = {
    title: 'Frontend Development Intern',
    company: 'Google Philippines',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    card: {
      ...commonStyles.dashboardCard,
      padding: '40px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '20px',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    textarea: {
      padding: '16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '1rem',
      minHeight: '150px',
      outline: 'none',
      ':focus': { borderColor: theme.colors.primary },
    },
    uploadArea: {
      border: `2px dashed ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '32px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: theme.colors.bgSecondary,
      ':hover': { borderColor: theme.colors.primary, backgroundColor: theme.colors.bgAccent },
    }
  };

  if (submitted) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.success }}>
            <CheckCircle size={48} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>Application Sent!</h2>
            <p style={{ color: theme.colors.textMuted }}>Your application for <strong>{listing.title}</strong> has been submitted successfully. You can track its status in your dashboard.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
              onClick={() => navigate('/applications')}
            >
              Go to Applications
            </button>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header>
        <button 
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textMuted, cursor: 'pointer', padding: 0, marginBottom: '16px' }}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Internship Application</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>
          <Building2 size={16} /> <span>{listing.company}</span> • <span>{listing.title}</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cover Letter / Introduction</label>
          <textarea 
            style={styles.textarea} 
            placeholder="Why are you interested in this position? What can you contribute to the team?"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Additional Documents (Optional)</label>
          <div style={styles.uploadArea}>
            <Upload size={32} color={theme.colors.textMuted} style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: 600 }}>Click to upload or drag and drop</div>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>PDF, DOCX up to 5MB</div>
          </div>
        </div>

        <div style={{ backgroundColor: theme.colors.bgAccent, padding: '20px', borderRadius: '12px', display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <Info size={20} color={theme.colors.primary} />
          <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, margin: 0 }}>
            Applying will share your <strong>Profile Details</strong>, <strong>Current Resume</strong>, and <strong>Skills</strong> with the employer. Make sure your profile is up to date.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 800 }}
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationFormPage;
