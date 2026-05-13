import React from 'react';
import { Loader2, GraduationCap } from 'lucide-react';
import { theme } from '../../styles/theme';

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
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        opacity: 0.8
      }}>
        <div style={{
          backgroundColor: theme.colors.primary,
          color: '#fff',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <GraduationCap size={24} />
        </div>
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 800, 
          color: '#0f172a',
          letterSpacing: '-0.02em'
        }}>
          InternLink
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Loader2 
          size={32} 
          className="animate-spin" 
          style={{ 
            color: theme.colors.primary,
            animation: 'spin 1s linear infinite'
          }} 
        />
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.875rem', 
          fontWeight: 500,
          margin: 0
        }}>
          Securing your session...
        </p>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;
