import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';

const Portfolio = () => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    },
    lockCard: {
      ...studentDesign.card,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      maxWidth: '400px',
      padding: '64px 32px',
    },
    iconBox: {
      width: '80px',
      height: '80px',
      borderRadius: '24px',
      backgroundColor: '#F1F5F9',
      color: studentDesign.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
    },
    heading: {
      fontSize: '20px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.textMain,
      margin: '0 0 12px 0',
    },
    text: {
      fontSize: '14px',
      color: studentDesign.colors.textMuted,
      lineHeight: '1.6',
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.lockCard}
      >
        <div style={styles.iconBox}>
          <Lock size={40} />
        </div>
        <h2 style={styles.heading}>Stage 3 is locked</h2>
        <p style={styles.text}>
          You need to complete your internship hours and have your during-internship documents approved by the OJT Head to unlock the Portfolio stage.
        </p>
      </motion.div>
    </div>
  );
};

export default Portfolio;
