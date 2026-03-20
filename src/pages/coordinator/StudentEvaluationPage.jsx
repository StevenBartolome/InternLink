import React, { useState } from 'react';
import { FileSpreadsheet, Check, AlertCircle, Star } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { mockStudents } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/StudentEvaluationPage.css';

const criteriaList = [
  { id: 1, name: "Academic Preparedness", weight: 20 },
  { id: 2, name: "Professional Behavior", weight: 25 },
  { id: 3, name: "Technical Skills", weight: 30 },
  { id: 4, name: "Communication", weight: 15 },
  { id: 5, name: "Adaptability", weight: 10 }
];

const StudentEvaluationPage = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState('');
  const [evaluatedStudents, setEvaluatedStudents] = useState([]);

  const studentsDue = mockStudents.filter(s => s.status === 'Placed' && s.hoursRendered >= 300 && !evaluatedStudents.includes(s.id));

  const handleScoreChange = (criteriaId, score) => {
    const val = parseFloat(score);
    if (isNaN(val) || val < 1 || val > 10) return;
    setScores(prev => ({ ...prev, [criteriaId]: val }));
  };

  const calculateOverall = () => {
    let total = 0;
    criteriaList.forEach(c => {
      const score = scores[c.id] || 0;
      total += (score / 10) * c.weight; // score out of 10, weight as percentage
    });
    return Math.round(total);
  };

  const getLetterGrade = (score) => {
    if (score >= 90) return 'A (Excellent)';
    if (score >= 80) return 'B (Good)';
    if (score >= 75) return 'C (Satisfactory)';
    return 'F (Fail)';
  };

  const handleSubmit = () => {
    if (Object.keys(scores).length < criteriaList.length) {
      alert("Please score all criteria.");
      return;
    }
    
    setEvaluatedStudents([...evaluatedStudents, selectedStudent.id]);
    alert(`Evaluation submitted for ${selectedStudent.name}. Score: ${calculateOverall()}%`);
    setSelectedStudent(null);
    setScores({});
    setRemarks('');
  };

  return (
    <div className="student-evaluation-page">
      {!selectedStudent ? (
        <div className="evaluation-list">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Students Due for Evaluation</h3>
              <p className="text-muted">Students who have rendered significant hours.</p>
            </div>
            
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Company</th>
                    <th>Hours Rendered</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsDue.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted">No students pending evaluation.</td></tr>
                  ) : (
                    studentsDue.map((student) => (
                      <tr key={student.id}>
                        <td><strong>{student.name}</strong></td>
                        <td>{student.company}</td>
                        <td>{student.hoursRendered} / {student.hoursRequired} hrs</td>
                        <td>
                          <button className="dashboard-btn dashboard-btn-primary btn-sm" onClick={() => setSelectedStudent(student)}>
                            Evaluate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="evaluation-form dashboard-card">
          <div className="form-header">
            <button className="dashboard-btn dashboard-btn-secondary btn-sm" onClick={() => setSelectedStudent(null)}>
              ← Back to List
            </button>
            <h3>Evaluation for {selectedStudent.name}</h3>
          </div>

          <div className="form-body">
            <div className="rubric-section">
              <h5>Performance Rubric</h5>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Criteria</th>
                      <th>Weight (%)</th>
                      <th>Score (1-10)</th>
                      <th>Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriaList.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.weight}%</td>
                        <td>
                          <input 
                            type="number" 
                            min="1" 
                            max="10" 
                            className="score-input"
                            value={scores[c.id] || ''}
                            onChange={(e) => handleScoreChange(c.id, e.target.value)}
                          />
                        </td>
                        <td>{scores[c.id] ? `${((scores[c.id] / 10) * c.weight).toFixed(1)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="summary-section">
              <div className="score-box">
                <span className="box-label">Overall Score</span>
                <h2 className="box-value">{calculateOverall()}%</h2>
                <span className="box-grade">{getLetterGrade(calculateOverall())}</span>
              </div>

              <div className="remarks-box">
                <label>Coordinator Remarks:</label>
                <textarea 
                  rows="4" 
                  placeholder="Enter feedback or performance notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="dashboard-btn btn-success" onClick={handleSubmit}>
                Submit Evaluation
              </button>
              <button className="dashboard-btn dashboard-btn-secondary" onClick={() => setSelectedStudent(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEvaluationPage;
