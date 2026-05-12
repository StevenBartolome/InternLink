import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  CheckCircle, 
  Edit3,
  Mail,
  User,
  Calendar
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';

const CompanyInfo = () => {
  const fields = [
    { label: 'Position / role', value: 'Software Engineer Intern', icon: Building2 },
    { label: 'Department', value: 'Product Development', icon: Building2 },
    { label: 'Company address', value: '123 Tech Avenue, Makati City, Philippines', icon: MapPin },
    { label: 'Supervisor name', value: 'Engr. John Doe', icon: User },
    { label: 'Supervisor email', value: 'johndoe@company.com', icon: Mail },
    { label: 'Start date', value: 'March 15, 2026', icon: Calendar },
  ];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editButton: {
      padding: '8px 16px',
      borderRadius: '10px',
      backgroundColor: 'transparent',
      color: studentDesign.colors.textMuted,
      border: `1px solid ${studentDesign.colors.border}`,
      fontWeight: studentDesign.typography.weights.medium,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
    },
    mainCard: {
      ...studentDesign.card,
    },
    companyHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '24px',
    },
    companyLogo: {
      width: '64px',
      height: '64px',
      borderRadius: '16px',
      backgroundColor: studentDesign.colors.primaryLight,
      color: studentDesign.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    companyName: {
      fontSize: '24px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.textMain,
      margin: 0,
    },
    location: {
      fontSize: '14px',
      color: studentDesign.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    verifiedBadge: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: '#F0FDF4',
      color: '#166534',
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.semibold,
      border: '1px solid #BBF7D0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '32px',
      paddingTop: '24px',
      borderTop: `1px solid ${studentDesign.colors.border}`,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    fieldLabel: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: studentDesign.colors.textMuted,
      fontWeight: studentDesign.typography.weights.semibold,
    },
    fieldValue: {
      fontSize: '15px',
      color: studentDesign.colors.textDark,
      fontWeight: studentDesign.typography.weights.medium,
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      <div style={styles.header}>
        <h2 style={{ fontSize: '18px', fontWeight: studentDesign.typography.weights.semibold }}>Company Information</h2>
        <motion.button 
          whileHover={{ backgroundColor: '#F8FAFC' }}
          style={styles.editButton}
        >
          <Edit3 size={16} /> Edit
        </motion.button>
      </div>

      <div style={styles.mainCard}>
        <div style={styles.companyHeader}>
          <div style={styles.companyLogo}>
            <Building2 size={32} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={styles.companyName}>TechNova Solutions Inc.</h1>
            <div style={styles.location}>
              <MapPin size={14} /> Makati City, Metro Manila
            </div>
          </div>
          <div style={styles.verifiedBadge}>
            <CheckCircle size={14} /> Verified
          </div>
        </div>

        <div style={styles.grid}>
          {fields.map((field, idx) => (
            <div key={idx} style={styles.field}>
              <span style={styles.fieldLabel}>{field.label}</span>
              <span style={styles.fieldValue}>{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyInfo;
