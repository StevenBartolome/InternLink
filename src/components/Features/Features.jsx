import React from 'react';
import '../../assets/css/students/Features.css';

const Features = () => {
  return (
    <section className="section-features" id="features">
      <div className="section-header">
        <h2>Tailored For Full Ecosystem</h2>
        <p>Connecting students and companies simple and efficiently.</p>
      </div>

      <div className="features-grid">
        {/* Student Feature Card */}
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fa-solid fa-user-graduate"></i>
          </div>
          <h3>For Students</h3>
          <p>Create your profile, showcase your skills, and let opportunities find you.</p>
          <ul className="feature-list">
            <li><i className="fa-solid fa-check"></i> Create Detailed Profile</li>
            <li><i className="fa-solid fa-check"></i> List Skills & Interests</li>
            <li><i className="fa-solid fa-check"></i> Browse Internship Feeds</li>
          </ul>
        </div>

        {/* Employer Feature Card */}
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fa-solid fa-briefcase"></i>
          </div>
          <h3>For Employers</h3>
          <p>Discover matched talent curated specifically for your vacancies.</p>
          <ul className="feature-list">
            <li><i className="fa-solid fa-check"></i> Create Company Account</li>
            <li><i className="fa-solid fa-check"></i> Post Internship Opportunities</li>
            <li><i className="fa-solid fa-check"></i> View Student Profiles</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Features;
