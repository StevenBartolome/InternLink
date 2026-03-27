// src/components/Footer/Footer.jsx
import React from 'react';
import { theme } from '../../../styles/theme';

const Footer = () => {
  const styles = {
    footer: {
      textAlign: 'center',
      padding: '2.5rem 1rem',
      backgroundColor: theme.colors.white,
      borderTop: `1px solid ${theme.colors.border}`,
      color: theme.colors.textMuted,
      fontSize: '0.9rem',
    }
  };

  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} InternLink. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
