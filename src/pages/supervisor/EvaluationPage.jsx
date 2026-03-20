// src/pages/supervisor/EvaluationPage/EvaluationPage.jsx
import React, { useState, useEffect } from 'react';
import { Star, FileSignature, CheckCircle2 } from 'lucide-react';
import { internsData } from '../../data/supervisorMockData';
import StatusBadge from '../../components/supervisor/StatusBadge';
import '../../assets/css/supervisor/EvaluationPage.css';

const EvaluationPage = () => {
  const [selectedInternId, setSelectedInternId] = useState(internsData[0].id);
  const [scores, setScores] = useState({
    attendance: 5,
    attitude: 5,
    workQuality: 5,
    punctuality: 5,
    teamwork: 5
  });
  const [remarks, setRemarks] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedIntern = internsData.find(i => i.id === parseInt(selectedInternId));

  useEffect(() => {
    // Reset form or load existing evaluation if already evaluated
    if (selectedIntern && selectedIntern.evaluationStatus === 'Evaluated') {
      setScores({
        attendance: selectedIntern.evaluation.attendance,
        attitude: selectedIntern.evaluation.attitude,
        workQuality: selectedIntern.evaluation.workQuality,
        punctuality: selectedIntern.evaluation.punctuality,
        teamwork: selectedIntern.evaluation.teamwork
      });
      setRemarks(selectedIntern.evaluation.remarks);
      setIsSubmitted(false); // Read-only mode, not "just submitted"
    } else {
      setScores({ attendance: 5, attitude: 5, workQuality: 5, punctuality: 5, teamwork: 5 });
      setRemarks('');
      setIsSubmitted(false);
    }
  }, [selectedInternId, selectedIntern]);

  const handleScoreChange = (criteria, value) => {
    if (selectedIntern.evaluationStatus === 'Evaluated') return;
    setScores({ ...scores, [criteria]: parseInt(value) });
  };

  const calculateOverall = () => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return (total / 5).toFixed(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    alert('Evaluation submitted successfully for ' + selectedIntern.name);
  };

  const criteriaList = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'attitude', label: 'Attitude' },
    { key: 'workQuality', label: 'Work Quality' },
    { key: 'punctuality', label: 'Punctuality' },
    { key: 'teamwork', label: 'Teamwork' }
  ];

  const handleInternClick = (id) => {
    setSelectedInternId(id);
  };

  return (
    <div className="supervisor-page-container">
      <div className="evaluation-layout">
        {/* Left: Interns List Nav */}
        <div className="eval-sidebar">
          <div className="card-supervisor list-card">
            <h3 className="section-title">Select Intern</h3>
            <div className="eval-intern-list">
              {internsData.map(intern => (
                <div 
                  key={intern.id} 
                  className={`eval-intern-item ${selectedInternId === intern.id ? 'active' : ''}`}
                  onClick={() => handleInternClick(intern.id)}
                >
                  <img src={intern.photo} alt={intern.name} className="eval-avatar" />
                  <div className="eval-info">
                    <span className="eval-name">{intern.name}</span>
                    <StatusBadge status={intern.evaluationStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Evaluation Form */}
        <div className="eval-form-container">
          {isSubmitted ? (
            <div className="card-supervisor success-card flex-center">
              <div className="success-content">
                <CheckCircle2 size={64} className="success-icon" />
                <h2>Evaluation Submitted!</h2>
                <p>Thank you for reviewing <strong>{selectedIntern.name}</strong>.</p>
                <div className="summary-box">
                  <span>Overall Score: <strong>{calculateOverall()} / 10</strong></span>
                </div>
                <button className="reset-view-btn" onClick={() => setIsSubmitted(false)}>
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="card-supervisor form-card">
              <div className="form-header">
                <div className="form-header-title">
                  <FileSignature size={24} className="header-icon" />
                  <div>
                    <h3>Performance Evaluation</h3>
                    <p>Reviewing: <strong>{selectedIntern.name}</strong> ({selectedIntern.course})</p>
                  </div>
                </div>
                {selectedIntern.evaluationStatus === 'Evaluated' && (
                  <span className="read-only-badge">Read-Only</span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="evaluation-form">
                <div className="criteria-section">
                  {criteriaList.map((item) => (
                    <div key={item.key} className="criteria-item">
                      <div className="criteria-info">
                        <span className="criteria-label">{item.label}</span>
                        <span className="criteria-value">{scores[item.key]} / 10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={scores[item.key]} 
                        onChange={(e) => handleScoreChange(item.key, e.target.value)}
                        disabled={selectedIntern.evaluationStatus === 'Evaluated'}
                        className="score-slider"
                      />
                    </div>
                  ))}
                </div>

                <div className="overall-summary">
                  <div className="overall-score-box">
                    <span className="overall-label">Overall Computed Score</span>
                    <span className="overall-val">{calculateOverall()}</span>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={18} 
                          fill={star <= Math.round(calculateOverall() / 2) ? "var(--warning)" : "none"}
                          color="var(--warning)" 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group remarks-group">
                  <label>Additional Remarks</label>
                  <textarea 
                    placeholder="Provide constructive feedback..."
                    value={remarks}
                    onChange={(e) => selectedIntern.evaluationStatus !== 'Evaluated' && setRemarks(e.target.value)}
                    disabled={selectedIntern.evaluationStatus === 'Evaluated'}
                    rows="4"
                    required
                  ></textarea>
                </div>

                {selectedIntern.evaluationStatus !== 'Evaluated' && (
                  <button type="submit" className="submit-eval-btn">
                    Submit Evaluation
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
