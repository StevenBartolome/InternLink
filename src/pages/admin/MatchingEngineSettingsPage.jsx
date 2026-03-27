import React, { useState } from 'react';
import { Settings, Play, Check, AlertCircle, RefreshCw, Sliders } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { matchingSettings, matchResults } from '../../data/adminMockData';

const MatchingEngineSettingsPage = () => {
  const [weights, setWeights] = useState(matchingSettings.weights);
  const [threshold, setThreshold] = useState(matchingSettings.threshold);
  const [isMatching, setIsMatching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleTriggerMatching = () => {
    setIsMatching(true);
    setShowResults(false);
    setTimeout(() => {
      setIsMatching(false);
      setShowResults(true);
    }, 2000);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
    },
    card: {
      ...commonStyles.dashboardCard,
    },
    weightItem: {
      marginBottom: '20px',
    },
    sliderLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.9rem',
      fontWeight: 600,
      marginBottom: '8px',
    },
    range: {
      width: '100%',
      accentColor: theme.colors.primary,
    },
    matchResult: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.bgPrimary,
    }
  };

  return (
    <div style={styles.container}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>AI Matching Engine Settings</h1>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>Configure the heuristic weights for the student-company placement algorithm.</p>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color={theme.colors.primary} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Weight Configuration</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} style={styles.weightItem}>
                <div style={styles.sliderLabel}>
                  <span style={{ textTransform: 'capitalize' }}>{key} Importance</span>
                  <span style={{ color: theme.colors.primary }}>{val}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={val} 
                  style={styles.range}
                  onChange={e => handleWeightChange(key, e.target.value)} 
                />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: totalWeight === 100 ? theme.colors.bgAccent : '#FEF2F2', color: totalWeight === 100 ? theme.colors.primary : theme.colors.danger, fontWeight: 700 }}>
              <span>Total Distribution:</span>
              <span>{totalWeight}%</span>
            </div>
            {totalWeight !== 100 && (
              <div style={{ fontSize: '0.75rem', color: theme.colors.danger, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} /> Total weight must equal 100% to save.
              </div>
            )}
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, width: '100%', marginTop: '24px' }}
              disabled={totalWeight !== 100}
            >
              Save Configuration
            </button>
          </div>
        </div>

        <div style={{ ...styles.card, background: theme.gradients.primary, color: '#fff' }}>
          <div style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Play size={48} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Execute Placement Run</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Force the system to re-calculate matches for all pending students and available slots.</p>
            <button 
              onClick={handleTriggerMatching}
              disabled={isMatching || totalWeight !== 100}
              style={{ ...commonStyles.dashboardBtn, backgroundColor: '#fff', color: theme.colors.primary, padding: '12px 32px', fontWeight: 800, fontSize: '1rem', width: '100%' }}
            >
              {isMatching ? <><RefreshCw size={20} className="spin" /> Processing...</> : 'Start Algorithm'}
            </button>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '12px' }}>
              Last executed: {matchingSettings.lastRun}
            </div>
          </div>
        </div>
      </div>

      {showResults && (
        <div style={styles.card}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.success }}>
            <Check size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Batch Results Preview</h3>
          </div>
          <div style={{ padding: '0 10px' }}>
            {matchResults.map(res => (
              <div key={res.id} style={styles.matchResult}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: theme.colors.primary }}>
                  {res.student.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{res.student}</div>
                  <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{res.position} at {res.company}</div>
                </div>
                <div style={{ fontWeight: 800, color: theme.colors.success }}>{res.score}% Match</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MatchingEngineSettingsPage;
