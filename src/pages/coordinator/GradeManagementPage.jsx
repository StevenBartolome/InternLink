import React, { useState } from 'react';
import { Award, Check, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { mockGradesData } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/GradeManagementPage.css';

const GradeManagementPage = () => {
  const [activeTab, setActiveTab ] = useState('For Grading');
  const [assignedGrades, setAssignedGrades] = useState({});
  const [gradesData, setGradesData] = useState(mockGradesData);

  const handleGradeChange = (studentName, grade) => {
    setAssignedGrades(prev => ({ ...prev, [studentName]: grade }));
  };

  const handleSubmitGrade = (studentName) => {
    const grade = assignedGrades[studentName];
    if (!grade) {
      alert("Please select a grade first.");
      return;
    }

    // Update local state to move to Graded
    const studentToGrade = gradesData.ongoing.find(s => s.name === studentName) || 
                          gradesData.forGrading.find(s => s.name === studentName);
                          
    if (!studentToGrade) return;

    const newGradedEntry = {
      studentName: studentToGrade.name,
      company: studentToGrade.company,
      supervisor: studentToGrade.supervisor,
      finalGrade: grade,
      dateGraded: new Date().toISOString().split('T')[0]
    };

    setGradesData(prev => ({
      ...prev,
      forGrading: prev.forGrading.filter(s => s.name !== studentName),
      ongoing: prev.ongoing.filter(s => s.name !== studentName),
      graded: [...prev.graded, newGradedEntry]
    }));

    // Clear selection
    const newGrades = { ...assignedGrades };
    delete newGrades[studentName];
    setAssignedGrades(newGrades);
  };

  return (
    <div className="grade-management-page">
      {/* Overview Stats */}
      <div className="grades-overview dashboard-card">
        <div className="overview-item">
          <span className="overview-label">Overall Class Average</span>
          <h2 className="overview-value text-primary">{gradesData.stats.averageGrade}</h2>
        </div>
        <div className="overview-item">
          <span className="overview-label">Total Graded</span>
          <h2 className="overview-value">{gradesData.graded.length}</h2>
        </div>
        <div className="overview-item">
          <span className="overview-label">Pending Grading</span>
          <h2 className="overview-value">{gradesData.forGrading.length}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="grades-tabs">
        {['For Grading', 'Graded', 'Ongoing'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="tab-count">
              {tab === 'For Grading' ? gradesData.forGrading.length :
               tab === 'Graded' ? gradesData.graded.length : 
               gradesData.ongoing.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grades-content">
        {activeTab === 'For Grading' && (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Company / Supervisor</th>
                  <th>Hours Rendered</th>
                  <th>Assign Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {gradesData.forGrading.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-muted">No students pending grading.</td></tr>
                ) : (
                  gradesData.forGrading.map((student) => (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong></td>
                      <td>
                        <div className="company-info">
                          <span>{student.company}</span>
                          <span className="supervisor-name">{student.supervisor}</span>
                        </div>
                      </td>
                      <td>{student.hoursRendered} / {student.hoursRequired} hrs</td>
                      <td>
                        <select 
                          className="grade-select"
                          value={assignedGrades[student.name] || ''}
                          onChange={(e) => handleGradeChange(student.name, e.target.value)}
                        >
                          <option value="">Select Grade</option>
                          <option value="1.0">1.0 (Excellent)</option>
                          <option value="1.25">1.25</option>
                          <option value="1.5">1.5</option>
                          <option value="1.75">1.75</option>
                          <option value="2.0">2.0</option>
                          <option value="2.25">2.25</option>
                          <option value="2.5">2.5</option>
                          <option value="3.0">3.0 (Pass)</option>
                          <option value="5.0">5.0 (Fail)</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className="dashboard-btn dashboard-btn-primary btn-sm"
                          onClick={() => handleSubmitGrade(student.name)}
                          disabled={!assignedGrades[student.name]}
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Graded' && (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Company / Supervisor</th>
                  <th>Final Grade</th>
                  <th>Date Graded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gradesData.graded.map((entry, index) => (
                  <tr key={index}>
                    <td><strong>{entry.studentName}</strong></td>
                    <td>
                      <div className="company-info">
                        <span>{entry.company}</span>
                        <span className="supervisor-name">{entry.supervisor}</span>
                      </div>
                    </td>
                    <td><span className="grade-badge">{entry.finalGrade}</span></td>
                    <td>{entry.dateGraded}</td>
                    <td><StatusBadge status="Graded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Ongoing' && (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Company</th>
                  <th>Hours Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gradesData.ongoing.map((student) => (
                  <tr key={student.id}>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.company}</td>
                    <td>{student.hoursRendered} / {student.hoursRequired} hrs</td>
                    <td><StatusBadge status="Ongoing" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeManagementPage;
