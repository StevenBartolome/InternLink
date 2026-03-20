import React, { useState } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { mockApplications } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/ApplicationTrackingPage.css';

const ApplicationTrackingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleExport = () => {
    alert('Exporting to CSV... (UI functionality only)');
  };

  return (
    <div className="application-tracking-page">
      {/* Header with Actions */}
      <div className="page-header-actions">
        <button className="dashboard-btn dashboard-btn-secondary" onClick={handleExport}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="dashboard-card filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by student, company, or position..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th></th>
              <th>Student Name</th>
              <th>Employer</th>
              <th>Position</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <React.Fragment key={app.id}>
                <tr className={`application-row ${expandedRow === app.id ? 'expanded' : ''}`} onClick={() => toggleRow(app.id)}>
                  <td>
                    {expandedRow === app.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                  <td><strong>{app.studentName}</strong></td>
                  <td>{app.employer}</td>
                  <td>{app.position}</td>
                  <td>{app.dateApplied}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>
                    <button className="dashboard-btn dashboard-btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); toggleRow(app.id); }}>
                      View Details
                    </button>
                  </td>
                </tr>
                {expandedRow === app.id && (
                  <tr className="expanded-row-content">
                    <td colSpan="7">
                      <div className="details-panel">
                        <div className="details-section">
                          <h5>Cover Letter</h5>
                          <p className="cover-letter-text">"{app.coverLetter}"</p>
                        </div>
                        <div className="details-section">
                          <h5>Skills</h5>
                          <div className="skills-list">
                            {app.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <div className="details-actions">
                          <button className="dashboard-btn dashboard-btn-primary btn-sm">View Student Profile</button>
                          {app.status === 'Pending' && (
                            <>
                              <button className="dashboard-btn dashboard-btn-success btn-sm">Approve</button>
                              <button className="dashboard-btn dashboard-btn-danger btn-sm">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationTrackingPage;
