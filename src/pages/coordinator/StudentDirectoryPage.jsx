import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { mockStudents } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/StudentDirectoryPage.css';

const StudentDirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null); // For Modal

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.id.includes(searchTerm);
    const matchesCourse = courseFilter === 'All' || student.course === courseFilter;
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openProfile = (student) => {
    setSelectedStudent(student);
  };

  const closeProfile = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="student-directory-page">
      {/* Filters Bar */}
      <div className="dashboard-card filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="All">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSBA">BSBA</option>
            </select>
          </div>

          <div className="filter-item">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Unplaced">Unplaced</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name / ID</th>
              <th>Course</th>
              <th>Status</th>
              <th>Assigned Company</th>
              <th>Hours Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="student-row" onClick={() => openProfile(student)}>
                <td>
                  <div className="student-info">
                    <img src={student.avatar} alt={student.name} className="avatar-small" />
                    <div>
                      <span className="student-name">{student.name}</span>
                      <span className="student-id">{student.id}</span>
                    </div>
                  </div>
                </td>
                <td>{student.course} ({student.yearLevel})</td>
                <td><StatusBadge status={student.status} /></td>
                <td>
                  {student.company ? (
                    <div className="company-info">
                      <span className="company-name">{student.company}</span>
                      <span className="supervisor-name">{student.supervisor}</span>
                    </div>
                  ) : (
                    <span className="text-muted">Not Placed</span>
                  )}
                </td>
                <td>
                  <ProgressBar value={student.hoursRendered} max={student.hoursRequired} size="sm" />
                  <span className="hours-text">{student.hoursRendered}/{student.hoursRequired} hrs</span>
                </td>
                <td>
                  <button className="dashboard-btn dashboard-btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openProfile(student); }}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={closeProfile}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile</h3>
              <button className="modal-close-btn" onClick={closeProfile}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-header-modal">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="avatar-large" />
                <div className="profile-header-text">
                  <h4>{selectedStudent.name}</h4>
                  <p>{selectedStudent.id} • {selectedStudent.course}</p>
                  <StatusBadge status={selectedStudent.status} />
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="details-section">
                  <h5>Academic Info</h5>
                  <p><strong>Year Level:</strong> {selectedStudent.yearLevel}</p>
                  <p><strong>Skills:</strong> {selectedStudent.skills.join(', ')}</p>
                </div>
                
                {selectedStudent.company && (
                  <div className="details-section">
                    <h5>Internship Info</h5>
                    <p><strong>Company:</strong> {selectedStudent.company}</p>
                    <p><strong>Supervisor:</strong> {selectedStudent.supervisor}</p>
                    <p><strong>Hours Rendered:</strong> {selectedStudent.hoursRendered} / {selectedStudent.hoursRequired}</p>
                    <ProgressBar value={selectedStudent.hoursRendered} max={selectedStudent.hoursRequired} />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="dashboard-btn dashboard-btn-primary">View Resume</button>
                <button className="dashboard-btn dashboard-btn-secondary" onClick={closeProfile}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDirectoryPage;
