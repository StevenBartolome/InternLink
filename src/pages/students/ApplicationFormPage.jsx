import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentProfile, internshipListings } from '../../data/mockData';
import { ArrowLeft, CheckCircle2, FileText, Upload } from 'lucide-react';
import '../../assets/css/students/ApplicationFormPage.css';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = internshipListings.find(item => item.id === parseInt(id));

  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (!listing) {
    return <div className="error-container">Invalid position.</div>;
  }

  if (isSubmitted) {
    return (
      <div className="success-state">
        <CheckCircle2 size={56} className="success-icon" />
        <h2>Application Submitted!</h2>
        <p>Your application for <strong>{listing.title}</strong> at <strong>{listing.company}</strong> has been sent successfully.</p>
        <div className="success-actions">
          <button onClick={() => navigate('/applications')} className="view-apps-btn">
            View My Applications
          </button>
          <button onClick={() => navigate('/internships')} className="back-browse-btn">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(`/internships/${id}`)}>
          <ArrowLeft size={18} /> Back to Details
        </button>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>Apply Position</h2>
          <p>Applying for <strong>{listing.title}</strong> at {listing.company}</p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={studentProfile.name} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={studentProfile.email} disabled className="disabled-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Course</label>
                <input type="text" value={studentProfile.course} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>Student ID</label>
                <input type="text" value={studentProfile.id} disabled className="disabled-input" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Application Documents</h4>
            <div className="form-group">
              <label>Cover Letter</label>
              <textarea 
                placeholder="Write a brief cover letter explaining why you're a good fit..." 
                rows="6"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Supporting Documents</label>
              <div className="attach-box">
                <div className="attach-left">
                  <FileText size={20} className="icon-doc" />
                  <span>Juan_DelaCruz_Resume_2026.pdf</span>
                </div>
                <div className="attach-right">
                  <span className="auto-attach-tag">Auto-attached</span>
                </div>
              </div>
              <div className="upload-placeholder">
                <Upload size={16} />
                <span>Upload additional file (Optional)</span>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-app-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
