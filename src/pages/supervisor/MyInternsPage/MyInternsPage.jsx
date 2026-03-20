// src/pages/supervisor/MyInternsPage/MyInternsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';
import { internsData } from '../../../data/supervisorMockData';
import StatusBadge from '../../../components/supervisor/StatusBadge';
import ProgressBar from '../../../components/supervisor/ProgressBar';
import './MyInternsPage.css';

const MyInternsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="supervisor-page-container">
      <div className="page-header">
        <div className="header-titles">
          <h2 className="title">My Assigned Interns</h2>
          <p className="subtitle">Monitor progress and manage daily logs</p>
        </div>
      </div>

      <div className="interns-grid">
        {internsData.map((intern) => (
          <div 
            key={intern.id} 
            className="intern-card card-supervisor"
            onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
          >
            <div className="card-header">
              <img src={intern.photo} alt={intern.name} className="intern-avatar-lg" />
              <div className="header-info">
                <StatusBadge status={intern.todayStatus} />
                <h3 className="intern-name">{intern.name}</h3>
                <span className="intern-course">{internsData.find(i => i.id === intern.id).course}</span>
              </div>
            </div>

            <div className="card-body">
              <div className="info-item">
                <GraduationCap size={16} className="info-icon" />
                <span>{intern.school}</span>
              </div>
              <div className="info-item">
                <Phone size={16} className="info-icon" />
                <span>{intern.contact}</span>
              </div>
              
              <div className="progress-section">
                <div className="section-label">Rendered Hours Progress</div>
                <ProgressBar rendered={intern.renderedHours} required={intern.requiredHours} />
                
                <div className="hours-metrics">
                  <div className="metric">
                    <span className="metric-val">{intern.renderedHours}</span>
                    <span className="metric-label">Rendered</span>
                  </div>
                  <div className="metric">
                    <span className="metric-val">{intern.requiredHours - intern.renderedHours}</span>
                    <span className="metric-label">Remaining</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button className="view-details-btn">
                View Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInternsPage;
