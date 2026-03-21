// src/pages/admin/ProfilePage.jsx
import React, { useState } from 'react';
import { adminProfile } from '../../data/adminMockData';
import { Mail, Shield, Award, CheckCircle, Edit2, MapPin, Phone } from 'lucide-react';
import '../../assets/css/students/ProfilePage.css'; // Share Student Profile CSS

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: adminProfile.email,
    systemName: adminProfile.systemName
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
    
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setIsEditing(false);
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
          {adminProfile.avatar ? (
            <img src={adminProfile.avatar} alt="Avatar" className="profile-avatar-lg" />
          ) : (
            <div className="profile-avatar-lg-placeholder"><Shield size={40} /></div>
          )}
          <div className="profile-info">
            <h1>{adminProfile.name}</h1>
            <p className="student-id">System ID: ADM-001</p>
            <div className="badge-container">
              <span className="course-badge">{adminProfile.role}</span>
              <span className="year-badge">System Root</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Contact Info Card */}
        <div className="profile-card">
          <div className="card-header-flex">
            <h3>Contact & Details</h3>
            <button className="edit-icon-btn" onClick={() => setIsEditing(!isEditing)}>
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
              <label><Award size={16} /> System Name</label>
              {isEditing ? (
                <input type="text" name="systemName" value={formData.systemName} onChange={handleChange} required />
              ) : (
                <span className="static-text">{formData.systemName}</span>
              )}
            </div>

            {isEditing && (
              <button type="submit" className="save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </form>
        </div>

        {/* System Node Card */}
        <div className="profile-card">
          <div className="card-header-flex">
            <h3>System Authority</h3>
          </div>
          <div className="section-block">
            <h4>Access Permissions</h4>
            <div className="skills-list">
              <span className="skill-chip">Global Settings Edit</span>
              <span className="skill-chip">Audit View</span>
              <span className="skill-chip">Delete Accounts</span>
              <span className="skill-chip">Bypass Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
