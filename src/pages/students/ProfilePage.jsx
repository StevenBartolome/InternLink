import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentProfile } from '../../data/mockData';
import { Mail, Phone, MapPin, Award, CheckCircle, Edit2, Plus, FileText, Download, Eye, Upload } from 'lucide-react';
import '../../assets/css/students/ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: studentProfile.email,
    contact: studentProfile.contact,
    address: studentProfile.address
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API save
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setIsEditing(false); // Turn off edit mode
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="profile-container">
      {showToast && (
        <div className="toast success">
          <CheckCircle size={20} />
          <span>Changes saved successfully!</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <img src={studentProfile.avatar} alt="Avatar" className="profile-avatar-lg" />
          <div className="profile-info">
            <h1>{studentProfile.name}</h1>
            <p className="student-id">{studentProfile.id}</p>
            <div className="badge-container">
              <span className="course-badge">{studentProfile.course}</span>
              <span className="year-badge">{studentProfile.yearLevel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Contact & About */}
        <div className="profile-card">
          <div className="card-header-flex">
            <h3>Contact & Details</h3>
            <button className="edit-icon-btn" onClick={() => setIsEditing(!isEditing)} title="Edit Profile">
              <Edit2 size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label><Mail size={16} /> Email Address</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              ) : (
                <span className="static-text">{formData.email}</span>
              )}
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Contact Number</label>
              {isEditing ? (
                <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
              ) : (
                <span className="static-text">{formData.contact}</span>
              )}
            </div>

            <div className="form-group">
              <label><MapPin size={16} /> Home Address</label>
              {isEditing ? (
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required />
              ) : (
                <span className="static-text textarea-text">{formData.address}</span>
              )}
            </div>

            {isEditing && (
              <button type="submit" className="save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Skills & Certifications */}
        <div className="profile-card">
          <div className="card-header-flex">
            <h3>Skills & Certifications</h3>
            <button className="edit-icon-btn" onClick={() => navigate('/skills')} title="Add/Edit Skills">
              <Plus size={16} />
            </button>
          </div>

          <div className="section-block">
            <h4>Technical Skills</h4>
            <div className="skills-list">
              {studentProfile.skills.map((skill, index) => (
                <span key={index} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          <div className="section-block certifications-wrap">
            <h4>Certifications</h4>
            <div className="cert-list">
              {studentProfile.certifications.map((cert) => (
                <div key={cert.id} className="cert-item">
                  <div className="cert-icon">
                    <Award size={24} className="icon-award" />
                  </div>
                  <div className="cert-details">
                    <h5>{cert.title}</h5>
                    <p className="cert-issuer">{cert.issuer}</p>
                    <p className="cert-date">{cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Section: Resume & Documents */}
      <div className="profile-full-card">
        <div className="card-header-flex">
          <h3>Resume & Documents</h3>
          <button className="upload-link-btn" onClick={() => navigate('/resume')}>
            <Upload size={16} /> Upload Resume
          </button>
        </div>
        
        <div className="resume-preview-container">
          <div className="resume-document-card">
            <div className="doc-icon">
              <FileText size={40} className="text-primary" />
            </div>
            <div className="doc-info">
              <h4>{studentProfile.resumeFiles[0]?.filename || "Resume_Default.pdf"}</h4>
              <p>Uploaded on {studentProfile.resumeFiles[0]?.date || "Mar 15, 2026"}</p>
            </div>
            <div className="doc-actions">
              <button className="icon-action-btn" title="View"><Eye size={18} /></button>
              <button className="icon-action-btn" title="Download"><Download size={18} /></button>
            </div>
          </div>

          <div className="resume-visual-preview">
            <div className="resume-skeleton">
              <div className="skel-line header"></div>
              <div className="skel-line sub"></div>
              <div className="skel-box"></div>
              <div className="skel-line"></div>
              <div className="skel-line"></div>
            </div>
            <div className="resume-overlay">
              <button className="btn-view-sample"> <Eye size={16} /> View Sample Resume</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
