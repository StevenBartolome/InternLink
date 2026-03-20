import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Briefcase, Save } from 'lucide-react';
import { companyProfile } from '../../data/employerMockData';
import '../../assets/css/employer/CompanyProfilePage.css';

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState(companyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="profile-container">
      {showSuccess && (
        <div className="alert alert-success">
          Changes saved successfully!
        </div>
      )}

      <div className="profile-header-card">
        <div className="company-logo-large">
          {profile.logo ? (
            <img src={profile.logo} alt="Logo" />
          ) : (
            <Briefcase size={40} />
          )}
        </div>
        <div className="profile-header-info">
          <h1>{profile.name}</h1>
          <p className="industry-text">{profile.industry}</p>
          <div className="info-row">
            <MapPin size={16} /> <span>{profile.address}</span>
          </div>
          <div className="info-row">
            <Globe size={16} /> <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a>
          </div>
        </div>
      </div>

      <div className="profile-form-card">
        <h3>Edit Company Information</h3>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={profile.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label><Phone size={16} /> Contact Number</label>
            <input 
              type="text" 
              name="contactNumber" 
              value={profile.contactNumber} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group full-width">
            <label>Company Description</label>
            <textarea 
              name="description" 
              value={profile.description} 
              onChange={handleChange} 
              rows="5" 
              required 
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={isSaving}>
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
