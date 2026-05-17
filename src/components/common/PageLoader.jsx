import React from 'react';
import { studentDesign } from '../../styles/StudentDesign';

/**
 * PageLoader — matches the inline spinner style used across student pages
 * (CompanyInfo, Documents, etc): a thin border ring + small muted label.
 *
 * Props:
 *   message {string} — subtitle text shown below the spinner
 */
const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px',
      width: '100%',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: `3px solid ${studentDesign.colors.primary}20`,
        borderTop: `3px solid ${studentDesign.colors.primary}`,
        borderRadius: '50%',
        animation: 'spin-loader 0.8s linear infinite',
        marginBottom: '12px',
      }} />
      <style>{`
        @keyframes spin-loader {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{
        fontSize: '13px',
        fontWeight: studentDesign.typography?.weights?.semibold ?? 600,
        color: studentDesign.colors.textMuted,
      }}>
        {message}
      </span>
    </div>
  );
};

export default PageLoader;
