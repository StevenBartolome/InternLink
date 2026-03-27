import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Database, UserCheck, Briefcase, Zap, 
  Search, Sliders, CheckCircle, XCircle,
  AlertCircle, ArrowRight, Star
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockStudents, mockEmployerListings } from '../../services/mocks/coordinatorMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const AutomatedMatchingPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState([]);

  const handleRunMatching = () => {
    setIsMatching(true);
    // Simulate matching engine process
    setTimeout(() => {
      const results = mockStudents.slice(0, 5).map((student, idx) => ({
        id: `M${idx}`,
        student: student.name,
        company: mockEmployerListings[idx % mockEmployerListings.length].companyName,
        position: mockEmployerListings[idx % mockEmployerListings.length].position,
        score: Math.floor(Math.random() * 20) + 80, // 80-99%
      }));
      setMatchResults(results);
      setIsMatching(false);
    }, 2000);
  };

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
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    engineCard: {
      ...commonStyles.dashboardCard,
      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      padding: '48px',
      textAlign: 'center',
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: '20px',
    },
    matchCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    scoreBadge: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      border: `4px solid ${theme.colors.bgAccent}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
      fontWeight: 800,
      color: theme.colors.primary,
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Automated Matching Engine</h1>
        <button 
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
          onClick={() => setMatchResults([])}
        >
          Reset Engine
        </button>
      </header>

      {!matchResults.length ? (
        <div style={styles.engineCard}>
          <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: theme.shadows.md }}>
            <Zap size={48} color={theme.colors.primary} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Ready to Pair Interns?</h2>
            <p style={{ color: theme.colors.textMuted, maxWidth: '500px' }}>
              Our AI engine analyzes student skills, preferences, and company requirements to find the best possible matches.
            </p>
          </div>
          <button 
            style={{ 
              ...commonStyles.dashboardBtn, 
              ...commonStyles.dashboardBtnPrimary,
              padding: '16px 32px',
              fontSize: '1rem',
              borderRadius: '16px'
            }}
            onClick={handleRunMatching}
            disabled={isMatching}
          >
            {isMatching ? 'Processing Neural Network...' : 'Run Matching Algorithm'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.success }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 700 }}>Generated {matchResults.length} high-confidence matches.</span>
          </div>
          <div style={styles.resultsGrid}>
            {matchResults.map(match => (
              <div key={match.id} style={styles.matchCard}>
                <div style={styles.scoreBadge}>{match.score}%</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{match.student}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: theme.colors.textMuted, marginTop: '4px' }}>
                    <Briefcase size={14} />
                    <span>{match.position} at {match.company}</span>
                  </div>
                </div>
                <button 
                  style={{ ...commonStyles.dashboardBtn, padding: '8px', backgroundColor: theme.colors.bgAccent, color: theme.colors.primary }}
                  onClick={() => showToast && showToast(`Finalizing match for ${match.student}...`, 'success')}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary Small */}
      <div style={{ ...commonStyles.dashboardCard, display: 'flex', justifyContent: 'space-around', padding: '24px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, textTransform: 'uppercase' }}>Unplaced Students</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{mockStudents.filter(s => s.status !== 'Placed').length}</div>
        </div>
        <div style={{ borderLeft: `1px solid ${theme.colors.border}` }}></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, textTransform: 'uppercase' }}>Open Listings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{mockEmployerListings.length}</div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedMatchingPage;
