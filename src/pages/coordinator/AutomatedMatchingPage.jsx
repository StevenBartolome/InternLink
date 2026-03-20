import React, { useState } from 'react';
import { Cpu, Check, X, Sliders, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { mockSuggestedMatches, mockEmployerListings } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/AutomatedMatchingPage.css';

const AutomatedMatchingPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [matches, setMatches] = useState(mockSuggestedMatches);
  const [selectedMatch, setSelectedMatch] = useState(null); // For Override Modal
  const [selectedCompany, setSelectedCompany] = useState('');

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'All') return true;
    return match.status === activeTab;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  };

  const handleAccept = (id) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'Accepted' } : m));
  };

  const handleOverride = (id) => {
    const match = matches.find(m => m.id === id);
    setSelectedMatch(match);
  };

  const submitOverride = () => {
    if (!selectedCompany) {
      alert("Please select a company.");
      return;
    }
    setMatches(prev => prev.map(m => m.id === selectedMatch.id ? { 
      ...m, 
      status: 'Overridden', 
      matchedCompany: selectedCompany,
      matchScore: 'N/A (Manual)'
    } : m));
    setSelectedMatch(null);
    setSelectedCompany('');
  };

  return (
    <div className="automated-matching-page">
      {/* Intro Banner */}
      <div className="match-banner dashboard-card">
        <div className="banner-content">
          <Cpu size={40} className="banner-icon" />
          <div>
            <h2>AI-Suggested Matches</h2>
            <p>We've analyzed student skills and internship requirements to find the best placements.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="match-tabs">
        {['All', 'Pending', 'Accepted', 'Overridden'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="tab-count">
              {tab === 'All' ? matches.length : matches.filter(m => m.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Skills Summary</th>
              <th>Matched Company</th>
              <th>Position</th>
              <th>Match Score</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match) => (
              <tr key={match.id}>
                <td><strong>{match.studentName}</strong></td>
                <td><span className="skills-summary">{match.skills}</span></td>
                <td>{match.matchedCompany}</td>
                <td>{match.position}</td>
                <td>
                  <span className={`score-badge ${getScoreColor(match.matchScore)}`}>
                    {match.matchScore}{typeof match.matchScore === 'number' ? '%' : ''}
                  </span>
                </td>
                <td><StatusBadge status={match.status} /></td>
                <td>
                  {match.status === 'Pending' && (
                    <div className="action-buttons">
                      <button className="dashboard-btn btn-success btn-sm" onClick={() => handleAccept(match.id)}>
                        <Check size={16} /> Accept
                      </button>
                      <button className="dashboard-btn btn-secondary btn-sm" onClick={() => handleOverride(match.id)}>
                        <Sliders size={16} /> Override
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Override Modal */}
      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manual Match Override</h3>
              <button className="modal-close-btn" onClick={() => setSelectedMatch(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p>Override match for <strong>{selectedMatch.studentName}</strong></p>
              
              <div className="form-group">
                <label>Select Alternative Company:</label>
                <select 
                  className="match-select"
                  value={selectedCompany} 
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="">Select a company</option>
                  {mockEmployerListings.map(l => (
                    <option key={l.id} value={l.companyName}>{l.companyName} - {l.position}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button className="dashboard-btn dashboard-btn-primary" onClick={submitOverride}>
                  Confirm Override
                </button>
                <button className="dashboard-btn dashboard-btn-secondary" onClick={() => setSelectedMatch(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedMatchingPage;
