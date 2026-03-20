import React, { useState } from 'react';
import { applicationRecords } from '../../data/mockData';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import '../../assets/css/students/MyApplicationsPage.css';

export default function MyApplicationsPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="status-badge approved"><CheckCircle2 size={14} /> Approved</span>;
      case 'Rejected':
        return <span className="status-badge rejected"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
    }
  };

  const filteredApplications = applicationRecords.filter(app => 
    app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="applications-container">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track the status of your sent internship applications.</p>
      </div>

      <div className="top-utils">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search company or position..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="applications-list">
        {filteredApplications.length === 0 ? (
          <p className="empty-state">No applications found matches.</p>
        ) : (
          filteredApplications.map(app => {
            const isExpanded = expandedId === app.id;
            return (
              <div key={app.id} className={`application-card ${isExpanded ? 'active-shadow' : ''}`}>
                <div className="app-summary" onClick={() => toggleExpand(app.id)}>
                  <div className="app-left">
                    <div className="company-logo-placeholder">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <h3>{app.position}</h3>
                      <p className="company-text">{app.company}</p>
                    </div>
                  </div>

                  <div className="app-right">
                    <span className="app-date">Applied on {app.dateApplied}</span>
                    {getStatusBadge(app.status)}
                    <button className="expand-btn">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Details Row */}
                <div className={`app-details ${isExpanded ? 'expanded' : ''}`}>
                  <div className="details-content">
                    <div className="detail-block">
                      <h4>Cover Letter / Remarks</h4>
                      <p>{app.coverLetter || "No cover letter submitted."}</p>
                    </div>
                    <div className="detail-block document-block">
                      <h4>Submitted Documents</h4>
                      <div className="doc-item">
                        <span>📄 Juan_DelaCruz_Resume_2026.pdf</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
