import React from 'react';
import { Mail, Phone, MapPin, Award, BookOpen, Calendar, User, Shield } from 'lucide-react';
import { coordinatorProfile } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="profile-header dashboard-card">
        <div className="profile-cover"></div>
        <div className="profile-avatar-wrapper">
          <img src={coordinatorProfile.avatar} alt={coordinatorProfile.name} className="profile-avatar-large" />
        </div>
        <div className="profile-info-header">
          <h2>{coordinatorProfile.name}</h2>
          <p className="text-muted"><Shield size={16} className="inline-icon" /> {coordinatorProfile.role}</p>
          <span className="profile-status badge-success">Active</span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>
          <div className="info-list">
            <div className="info-item">
              <Mail size={18} className="text-secondary" />
              <div>
                <label>Email Address</label>
                <span>{coordinatorProfile.email}</span>
              </div>
            </div>
            <div className="info-item">
              <Phone size={18} className="text-secondary" />
              <div>
                <label>Phone Number</label>
                <span>+63 912 345 6789</span>
              </div>
            </div>
            <div className="info-item">
              <MapPin size={18} className="text-secondary" />
              <div>
                <label>Office Location</label>
                <span>Office of Student Affairs, 3rd Floor, Main Bldg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Academic Details</h3>
          </div>
          <div className="info-list">
            <div className="info-item">
              <BookOpen size={18} className="text-secondary" />
              <div>
                <label>School / University</label>
                <span>{coordinatorProfile.school}</span>
              </div>
            </div>
            <div className="info-item">
              <Award size={18} className="text-secondary" />
              <div>
                <label>Department</label>
                <span>{coordinatorProfile.department}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar size={18} className="text-secondary" />
              <div>
                <label>Date Joined</label>
                <span>August 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
