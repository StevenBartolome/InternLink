import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { internshipListings } from '../data/mockData';
import { MapPin, Clock, Briefcase, Calendar, ArrowLeft, Building2 } from 'lucide-react';
import '../assets/css/students/InternshipDetailPage.css';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the specific internship listing by ID
  const listing = internshipListings.find(item => item.id === parseInt(id));

  if (!listing) {
    return (
      <div className="error-container">
        <h2>Internship not found</h2>
        <p>The position you are looking for does not exist or has been closed.</p>
        <Link to="/internships" className="back-link">
          <ArrowLeft size={16} /> Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/internships')}>
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="detail-grid">
        {/* Main Content (Left) */}
        <div className="main-info">
          <div className="title-section">
            <span className="industry-tag">{listing.industry}</span>
            <h1>{listing.title}</h1>
            <div className="meta-row">
              <div className="meta-item">
                <Building2 size={16} />
                <span>{listing.company}</span>
              </div>
              <div className="meta-item">
                <MapPin size={16} />
                <span>{listing.location}</span>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>

          <div className="content-section">
            <h3>Responsibilities</h3>
            <ul>
              {listing.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h3>Requirements</h3>
            <ul>
              {listing.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="sidebar-info">
          <div className="info-card">
            <h3>Quick Overview</h3>
            <div className="overview-list">
              <div className="overview-item">
                <Clock size={18} className="overview-icon" />
                <div>
                  <label>Duration</label>
                  <span>{listing.duration}</span>
                </div>
              </div>
              <div className="overview-item">
                <Briefcase size={18} className="overview-icon" />
                <div>
                  <label>Positions</label>
                  <span>{listing.slots} Slots Left</span>
                </div>
              </div>
              <div className="overview-item">
                <Calendar size={18} className="overview-icon" />
                <div>
                  <label>Timeline</label>
                  <span>Flexible Start Date</span>
                </div>
              </div>
            </div>

            <button 
              className="apply-btn"
              onClick={() => navigate(`/apply/${listing.id}`)}
            >
              Apply Now
            </button>
          </div>

          <div className="info-card company-card">
            <h3>About the Company</h3>
            <div className="company-info-snippet">
              <div className="company-logo-type">
                <Building2 size={24} />
              </div>
              <div>
                <h5>{listing.company}</h5>
                <span>Verified Employer</span>
              </div>
            </div>
            <p className="company-desc">
              Leading provider in {listing.industry.toLowerCase()} solutions, offering a nurturing environment for student learners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
