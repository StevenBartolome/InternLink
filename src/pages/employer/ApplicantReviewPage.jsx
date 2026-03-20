import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Mail, BookOpen, Award, FileText } from 'lucide-react';
import { internshipListings, applicants } from '../../data/employerMockData';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import '../../assets/css/employer/ApplicantReviewPage.css';

const ApplicantReviewPage = () => {
  const location = useLocation();
  const [selectedListingId, setSelectedListingId] = useState(
    location.state?.listingId || internshipListings[0]?.id || ''
  );
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const filteredApplicants = applicants.filter(
    app => app.listingId === selectedListingId
  );

  const handleSelectApplicant = (app) => {
    setSelectedApplicant(app);
  };

  const handleClosePanel = () => {
    setSelectedApplicant(null);
  };

  return (
    <div className="review-container">
      <div className="review-header">
        <div>
          <h1>Applicant Review</h1>
          <p className="subtitle">Review and manage candidates for your listings.</p>
        </div>
        
        <div className="selector-group">
          <label>Filter by Listing:</label>
          <select 
            value={selectedListingId} 
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="listing-select"
          >
            {internshipListings.map(listing => (
              <option key={listing.id} value={listing.id}>
                {listing.jobTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="review-content">
        <div className={`table-section ${selectedApplicant ? 'shrink' : ''}`}>
          <div className="table-card">
            {filteredApplicants.length > 0 ? (
              <div className="table-responsive">
                <table className="review-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Course</th>
                      <th>Year</th>
                      <th>Date Applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map(app => (
                      <tr 
                        key={app.id} 
                        onClick={() => handleSelectApplicant(app)}
                        className={`clickable-row ${selectedApplicant?.id === app.id ? 'selected' : ''}`}
                      >
                        <td><span className="font-semibold">{app.studentName}</span></td>
                        <td>{app.course}</td>
                        <td>{app.yearLevel}</td>
                        <td>{app.dateApplied}</td>
                        <td><StatusBadge status={app.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No applicants for this listing yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        {selectedApplicant && (
          <div className="side-panel">
            <div className="panel-header">
              <h3>Applicant Details</h3>
              <button className="btn-close" onClick={handleClosePanel}><X size={18} /></button>
            </div>
            
            <div className="panel-body">
              <div className="panel-section profile-summary">
                <div className="avatar-large">
                  {selectedApplicant.studentName.charAt(0)}
                </div>
                <h4>{selectedApplicant.studentName}</h4>
                <p className="sub-text">{selectedApplicant.course} ({selectedApplicant.yearLevel})</p>
                <div className="badge-row">
                  <StatusBadge status={selectedApplicant.status} />
                </div>
              </div>

              <div className="panel-section">
                <h5><Mail size={16} /> Contact Info</h5>
                <p className="text-small">student.email@example.com</p>
              </div>

              <div className="panel-section">
                <h5><Award size={16} /> Skills</h5>
                <div className="chips-container">
                  {selectedApplicant.skills?.map((skill, index) => (
                    <span key={index} className="chip">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <h5><FileText size={16} /> Cover Letter</h5>
                <div className="letter-box">
                  <p>{selectedApplicant.coverLetter}</p>
                </div>
              </div>

              <div className="panel-section">
                <h5><BookOpen size={16} /> Documents</h5>
                <a href={selectedApplicant.resumeLink} className="download-link">
                  View Resume / CV
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantReviewPage;
