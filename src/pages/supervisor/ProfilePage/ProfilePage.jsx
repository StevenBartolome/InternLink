// src/pages/supervisor/ProfilePage/ProfilePage.jsx
import React, { useState } from 'react';
import { User, Mail, Building, Phone, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { supervisorData } from '../../../data/supervisorMockData';
import './ProfilePage.css';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: supervisorData.name,
    email: supervisorData.email || 'supervisor@gmail.com',
    department: supervisorData.department,
    phone: supervisorData.phone || '+63 912 345 6789',
    employeeId: supervisorData.employeeId || 'SUP-2026-0042',
    joinDate: supervisorData.joinDate || 'Jan 2025'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      // Update mock data in-memory if needed
      supervisorData.name = formData.name;
      supervisorData.department = formData.department;
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="supervisor-page-container">
      {showSuccess && (
        <div className="alert alert-success flex-center gap-2">
          <CheckCircle2 size={18} /> Profile updated successfully!
        </div>
      )}

      <div className="page-header">
        <h2 className="title">My Profile</h2>
        <p className="subtitle">View and update your supervisor account details</p>
      </div>

      <div className="profile-layout">
        {/* Left: Avatar Card */}
        <div className="profile-left">
          <div className="card-supervisor profile-card">
            <div className="profile-avatar-wrapper">
              <img src={supervisorData.avatar} alt={formData.name} className="profile-avatar-large" />
            </div>
            <h3 className="profile-name">{formData.name}</h3>
            <p className="profile-role">{supervisorData.role}</p>
            <div className="profile-stat-item">
              <Building size={16} />
              <span>{formData.department}</span>
            </div>
          </div>
        </div>

        {/* Right: Form Card */}
        <div className="profile-right">
          <div className="card-supervisor form-card">
            <h3 className="section-title">Account Information</h3>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name"><User size={16} /> Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email"><Mail size={16} /> Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department"><Building size={16} /> Department</label>
                  <input 
                    type="text" 
                    id="department" 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone"><Phone size={16} /> Contact Number</label>
                  <input 
                    type="text" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group readonly">
                  <label><User size={16} /> Employee ID</label>
                  <input type="text" value={formData.employeeId} disabled />
                  <span className="help-text">Read-only field</span>
                </div>

                <div className="form-group readonly">
                  <label><Calendar size={16} /> Joined</label>
                  <input type="text" value={formData.joinDate} disabled />
                  <span className="help-text">Read-only field</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={isSaving}>
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
