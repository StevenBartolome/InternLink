import React from 'react';
import { studentDesign } from '../../styles/StudentDesign';

/**
 * LoadingScreen — full-viewport auth-level loading screen.
 * Uses the same ring spinner style as PageLoader / CompanyInfo / Documents.
 */
const LoadingScreen = () => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
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
        fontWeight: 600,
        color: '#64748b',
      }}>
        Securing your session...
      </span>
    </div>
  );
};

export default LoadingScreen;
