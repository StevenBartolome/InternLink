// src/pages/employer/AssignSupervisorPage/AssignSupervisorPage.jsx
import React, { useState } from 'react';
import { UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { activeInterns, supervisors } from '../../../data/employerMockData';
import './AssignSupervisorPage.css';

const AssignSupervisorPage = () => {
  const [selectedInternId, setSelectedInternId] = useState(activeInterns[0]?.id || '');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedIntern = activeInterns.find(i => i.id === selectedInternId);

  // Set initial supervisor based on selected intern
  React.useEffect(() => {
    if (selectedIntern) {
      const currentSup = supervisors.find(s => s.name === selectedIntern.supervisor);
      setSelectedSupervisorId(currentSup ? currentSup.id : '');
    }
  }, [selectedInternId, selectedIntern]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupervisorId) return alert('Please select a supervisor');
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      if (selectedIntern) {
        const sup = supervisors.find(s => s.id === parseInt(selectedSupervisorId));
        selectedIntern.supervisor = sup ? sup.name : 'Not Assigned'; // Update mock in-memory
      }
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="assign-sup-container">
      {showSuccess && (
        <div className="alert alert-success flex-center gap-2">
          <CheckCircle2 size={18} /> Supervisor assigned successfully!
        </div>
      )}

      <div className="eval-header">
        <h1>Assign Supervisors</h1>
        <p className="subtitle">Delegate interns to respective supervisors for closer monitoring.</p>
      </div>

      <div className="eval-content">
        {/* Intern Selection */}
        <div className="intern-selector-section">
          <h3>Select Intern</h3>
          <div className="intern-list-mini">
            {activeInterns.map(intern => (
              <div 
                key={intern.id} 
                className={`intern-select-card ${selectedInternId === intern.id ? 'selected' : ''}`}
                onClick={() => setSelectedInternId(intern.id)}
              >
                <div className="avatar-mini">{intern.studentName.charAt(0)}</div>
                <div>
                  <h4>{intern.studentName}</h4>
                  <p className="sub-text">{intern.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Form */}
        {selectedIntern && (
          <div className="eval-form-section">
            <div className="form-card">
              <div className="form-header">
                <h3>Intern: {selectedIntern.studentName}</h3>
                <span className="position-tag">{selectedIntern.position}</span>
              </div>

              <div className="current-assignment-banner">
                <ShieldAlert size={18} className="info-icon" />
                <span>
                  Current Supervisor: <strong>{selectedIntern.supervisor || "Not Assigned"}</strong>
                </span>
              </div>

              <form onSubmit={handleSubmit} className="assign-form">
                <div className="form-group">
                  <label htmlFor="supervisor-select">Select Supervisor</label>
                  <select 
                    id="supervisor-select"
                    value={selectedSupervisorId}
                    onChange={(e) => setSelectedSupervisorId(e.target.value)}
                    required
                    className="dropdown-select"
                  >
                    <option value="" disabled>-- Choose a Supervisor --</option>
                    {supervisors.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={isSaving}>
                    <UserPlus size={18} /> {isSaving ? 'Assigning...' : 'Assign Supervisor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignSupervisorPage;
