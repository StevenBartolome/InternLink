// src/pages/admin/MatchingEngineSettingsPage.jsx
import React, { useState } from 'react';
import { Settings, Play, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { matchingSettings, matchResults } from '../../data/adminMockData';
import '../../assets/css/admin/MatchingEngineSettingsPage.css';

const MatchingEngineSettingsPage = () => {
  const [weights, setWeights] = useState(matchingSettings.weights);
  const [threshold, setThreshold] = useState(matchingSettings.threshold);
  const [maxMatches, setMaxMatches] = useState(matchingSettings.maxMatches);
  const [autoAccept, setAutoAccept] = useState(matchingSettings.autoAccept);
  const [notifyCoordinator, setNotifyCoordinator] = useState(matchingSettings.notifyCoordinator);

  const [isMatching, setIsMatching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleWeightChange = (key, value) => {
    setWeights(prev => {
      const newWeights = { ...prev, [key]: parseInt(value) };
      // Normalizing logic optional for mock, but lets just update
      return newWeights;
    });
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleTriggerMatching = () => {
    setIsMatching(true);
    setShowResults(false);
    setTimeout(() => {
      setIsMatching(false);
      setShowResults(true);
    }, 2000); // Simulate 2 second delay
  };

  return (
    <div className="matching-settings-page">
      <div className="settings-grid">
        {/* Configuration Form */}
        <div className="settings-card config-form">
          <div className="card-header">
            <Settings size={20} className="header-icon" />
            <h3>Algorithm Weight Configuration</h3>
          </div>
          <div className="card-content">
            <div className="weight-sliders">
              <div className="slider-item">
                <div className="slider-label">
                  <span>Skills Match %</span>
                  <span className="weight-badge">{weights.skills}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={weights.skills} 
                  onChange={e => handleWeightChange('skills', e.target.value)} 
                />
              </div>

              <div className="slider-item">
                <div className="slider-label">
                  <span>Location Preference %</span>
                  <span className="weight-badge">{weights.location}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={weights.location} 
                  onChange={e => handleWeightChange('location', e.target.value)} 
                />
              </div>

              <div className="slider-item">
                <div className="slider-label">
                  <span>Course Relevance %</span>
                  <span className="weight-badge">{weights.course}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={weights.course} 
                  onChange={e => handleWeightChange('course', e.target.value)} 
                />
              </div>

              <div className="slider-item">
                <div className="slider-label">
                  <span>Availability %</span>
                  <span className="weight-badge">{weights.availability}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={weights.availability} 
                  onChange={e => handleWeightChange('availability', e.target.value)} 
                />
              </div>
            </div>

            <div className="total-weight-bar">
              <span>Total Weight: <strong>{totalWeight}%</strong></span>
              {totalWeight !== 100 && (
                <span className="weight-warning">
                  <AlertCircle size={16} /> Must total 100%
                </span>
              )}
            </div>

            <div className="divider"></div>

            <div className="input-group">
              <div className="input-item">
                <label>Minimum Match Score Threshold</label>
                <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
              </div>
              <div className="input-item">
                <label>Max Matches Per Student</label>
                <input type="number" value={maxMatches} onChange={e => setMaxMatches(e.target.value)} />
              </div>
            </div>

            <div className="toggle-group">
              <label className="toggle-item">
                <input type="checkbox" checked={autoAccept} onChange={e => setAutoAccept(e.target.checked)} />
                <span className="toggle-label">Auto-accept matches above threshold</span>
              </label>
              <label className="toggle-item">
                <input type="checkbox" checked={notifyCoordinator} onChange={e => setNotifyCoordinator(e.target.checked)} />
                <span className="toggle-label">Notify coordinator on new matches</span>
              </label>
            </div>

            <button className="submit-settings-btn" disabled={totalWeight !== 100}>
              Save Settings
            </button>
          </div>
        </div>

        {/* Action Panel */}
        <div className="settings-card action-panel">
          <div className="card-header">
            <Play size={20} className="header-icon" />
            <h3>Trigger Matching</h3>
          </div>
          <div className="card-content centered">
            <p className="action-description">
              Run the algorithm now to generate new student-company pairings based on current configuration.
            </p>
            
            <button 
              className={`trigger-match-btn ${isMatching ? 'loading' : ''}`} 
              onClick={handleTriggerMatching}
              disabled={isMatching || totalWeight !== 100}
            >
              {isMatching ? (
                <>
                  <RefreshCw size={20} className="spin-icon" /> Matching in progress...
                </>
              ) : (
                <>
                  <Play size={20} /> Start Matching Run
                </>
              )}
            </button>

            <div className="last-run-info">
              <span>Last Run: <strong>{matchingSettings.lastRun}</strong></span>
              <span>Matches Generated: <strong>{matchingSettings.lastRunMatches}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Results Preview */}
      {showResults && (
        <div className="results-card">
          <div className="results-header">
            <Check size={24} className="success-icon" />
            <div>
              <h4>Matching Complete!</h4>
              <p>5 matches generated based on threshold {threshold}%.</p>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="matches-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Matched Company</th>
                  <th>Position</th>
                  <th>Match Score</th>
                </tr>
              </thead>
              <tbody>
                {matchResults.map(res => (
                  <tr key={res.id}>
                    <td>{res.student}</td>
                    <td>{res.company}</td>
                    <td>{res.position}</td>
                    <td>
                      <span className={`score-badge ${res.score >= 80 ? 'high' : 'medium'}`}>
                        {res.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingEngineSettingsPage;
