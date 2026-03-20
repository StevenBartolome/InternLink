import React, { useState } from 'react';
import { Search, Filter, Calendar, CheckSquare, Clock, X } from 'lucide-react';
import ProgressBar from '../../../components/coordinator/ProgressBar';
import StatusBadge from '../../../components/coordinator/StatusBadge';
import { mockProgressData } from '../../../data/coordinatorMockData';
import '../../../assets/css/coordinator/ProgressMonitoringPage.css';

const ProgressMonitoringPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [completionFilter, setCompletionFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null); // For Detail Modal

  const students = mockProgressData.students;

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Calculate percentage for filter
    const pct = (student.hoursRendered / student.hoursRequired) * 100;
    let matchesCompletion = true;
    if (completionFilter === 'High') matchesCompletion = pct >= 80;
    else if (completionFilter === 'Mid') matchesCompletion = pct >= 50 && pct < 80;
    else if (completionFilter === 'Low') matchesCompletion = pct < 50;

    return matchesSearch && matchesCompletion;
  });

  const openDetail = (student) => {
    setSelectedStudent(student);
  };

  const closeDetail = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="progress-monitoring-page">
      {/* Filters Bar */}
      <div className="coordinator-card filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search student or company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={completionFilter} onChange={(e) => setCompletionFilter(e.target.value)}>
              <option value="All">All Progress</option>
              <option value="High">80%+ Complete</option>
              <option value="Mid">50% - 79% Complete</option>
              <option value="Low">Below 50%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="progress-grid">
        {filteredStudents.map((student) => (
          <div key={student.id} className="progress-card coordinator-card" onClick={() => openDetail(student)}>
            <div className="card-header-student">
              <img src={student.avatar} alt={student.name} className="avatar-small" />
              <div>
                <h4>{student.name}</h4>
                <p className="company-text">{student.company}</p>
              </div>
            </div>

            <div className="progress-stats">
              <div className="stat-row">
                <div className="stat-label">
                  <Clock size={16} /> Hours Rendered
                </div>
                <div className="stat-value">{student.hoursRendered} / {student.hoursRequired}</div>
              </div>
              <ProgressBar value={student.hoursRendered} max={student.hoursRequired} />

              <div className="divider"></div>

              <div className="stat-row">
                <div className="stat-label">
                  <CheckSquare size={16} /> Tasks done
                </div>
                <div className="stat-value">{student.taskCompletionRate}</div>
              </div>

              <div className="stat-row">
                <div className="stat-label">
                  <Calendar size={16} /> Attendance Rate
                </div>
                <div className="stat-value">{student.attendanceRate}</div>
              </div>
            </div>

            <div className="card-footer-date">
              <span>Last active: {student.lastActivityDate}</span>
              <button className="btn-link btn-sm">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={closeDetail}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Internship Progress Details</h3>
              <button className="modal-close-btn" onClick={closeDetail}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-header-modal">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="avatar-large" />
                <div className="profile-header-text">
                  <h4>{selectedStudent.name}</h4>
                  <p>{selectedStudent.company} • {selectedStudent.supervisor}</p>
                </div>
              </div>

              <div className="modal-tabs">
                <div className="modal-tab-content">
                  <div className="section">
                    <h5>Attendance Logs</h5>
                    <div className="coordinator-table-container">
                      <table className="coordinator-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.attendanceLogs.map((log, index) => (
                            <tr key={index}>
                              <td>{log.date}</td>
                              <td>{log.timeIn}</td>
                              <td>{log.timeOut}</td>
                              <td>{log.hours}h</td>
                              <td><StatusBadge status={log.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="section">
                    <h5>Task Management</h5>
                    <div className="coordinator-table-container">
                      <table className="coordinator-table">
                        <thead>
                          <tr>
                            <th>Task Description</th>
                            <th>Due Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.taskLogs.map((task, index) => (
                            <tr key={index}>
                              <td>{task.task}</td>
                              <td>{task.dueDate}</td>
                              <td><StatusBadge status={task.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="coordinator-btn coordinator-btn-secondary" onClick={closeDetail}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressMonitoringPage;
