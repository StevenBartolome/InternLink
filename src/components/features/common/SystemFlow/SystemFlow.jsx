import React from 'react';
import { theme } from '../../styles/theme';
import { ChevronRight, ArrowRight, UserCheck, ShieldCheck, MailCheck, Rocket } from 'lucide-react';

const SystemFlow = () => {
  const steps = [
    { title: 'Identity Verification', desc: 'Secure blockchain-based KYC for students and employers.', icon: ShieldCheck, color: '#3B82F6' },
    { title: 'Automated Matching', desc: 'AI-driven engine pairing skills with requirements.', icon: UserCheck, color: '#10B981' },
    { title: 'Smart Contracts', desc: 'Immutable internship agreements and term sheets.', icon: MailCheck, color: '#F59E0B' },
    { title: 'Career Launch', desc: 'Successful transition from intern to professional hire.', icon: Rocket, color: '#8B5CF6' }
  ];

  const styles = {
    container: {
      padding: '40px 0',
      width: '100%',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px',
      position: 'relative',
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '32px',
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      position: 'relative',
      zIndex: 1,
    },
    iconBox: (color) => ({
      width: '52px',
      height: '52px',
      borderRadius: '16px',
      backgroundColor: `${color}10`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    title: {
      fontSize: '1.25rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    desc: {
      fontSize: '0.925rem',
      color: theme.colors.textMuted,
      lineHeight: 1.6,
      margin: 0,
    },
    arrow: {
      position: 'absolute',
      right: '-24px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.colors.border,
      display: window.innerWidth > 1200 ? 'block' : 'none',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {steps.map((step, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.iconBox(step.color)}>
              <step.icon size={26} />
            </div>
            <h3 style={styles.title}>{step.title}</h3>
            <p style={styles.desc}>{step.desc}</p>
            {index < steps.length - 1 && (
              <div style={styles.arrow}>
                <ArrowRight size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemFlow;
