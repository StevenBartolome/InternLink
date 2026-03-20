import React from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationRecords, progressState, studentProfile } from '../../data/mockData';
import { FileText, CheckCircle2, Clock, Briefcase, ArrowRight, Star } from 'lucide-react';
import '../../assets/css/students/DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();

  const stats = [
    { 
      title: 'Applications', 
      value: applicationRecords.length, 
      icon: <FileText size={24} />, 
      color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' 
    },
    { 
      title: 'Approved', 
      value: applicationRecords.filter(a => a.status === 'Approved').length, 
      icon: <CheckCircle2 size={24} />, 
      color: 'linear-gradient(135deg, #10B981, #047857)' 
    },
    { 
      title: 'Hours Rendered', 
      value: `${progressState.hoursCompleted}h`, 
      icon: <Clock size={24} />, 
      color: 'linear-gradient(135deg, #F59E0B, #B45309)' 
    },
    { 
      title: 'Shortlisted', 
      value: 1, // Mocked 
      icon: <Star size={24} />, 
      color: 'linear-gradient(135deg, #8B5CF6, #5B21B6)' 
    }
  ];

  const hoursPercent = Math.round((progressState.hoursCompleted / progressState.hoursTotal) * 100);

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {studentProfile.name.split(' ')[0]}! 👋</h1>
          <p>Here's an overview of your internship progress and applications.</p>
        </div>
        <div className="welcome-stats">
          <span className="course-tag">{studentProfile.course}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <label>{stat.title}</label>
              <h3>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-layout">
        {/* Main Content (Left) */}
        <div className="dash-main">
          {/* Progress Card */}
          <div className="dash-card progress-overview">
            <div className="card-header">
              <h3>Active Placement</h3>
              <button onClick={() => navigate('/progress')} className="view-all-btn">
                View Progress <ArrowRight size={16} />
              </button>
            </div>
            <div className="placement-brief">
              <div className="brief-left">
                <h4>{progressState.company}</h4>
                <p>Supervisor: {progressState.supervisor}</p>
              </div>
              <div className="brief-right">
                <div className="progress-circle-placeholder">
                  <span className="percent-num">{hoursPercent}%</span>
                  <span className="percent-label">Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="dash-card">
            <div className="card-header">
              <h3>Recent Applications</h3>
              <button onClick={() => navigate('/applications')} className="view-all-btn">
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="applications-mini-list">
              {applicationRecords.slice(0, 3).map(app => (
                <div key={app.id} className="mini-app-item">
                  <div className="mini-app-left">
                    <div className="mini-logo">{app.company.charAt(0)}</div>
                    <div>
                      <span className="mini-title">{app.position}</span>
                      <span className="mini-company">{app.company}</span>
                    </div>
                  </div>
                  <span className={`mini-status ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets (Right) */}
        <div className="dash-side">
          <div className="dash-card shortcuts-card">
            <h3>Quick Actions</h3>
            <div className="shortcuts-grid">
              <button onClick={() => navigate('/internships')} className="shortcut-btn">
                <Briefcase size={20} />
                <span>Find Internships</span>
              </button>
              <button onClick={() => navigate('/profile')} className="shortcut-btn">
                <FileText size={20} />
                <span>Update Resume</span>
              </button>
            </div>
          </div>

          <div className="dash-card tips-card">
            <h3>System Guidance</h3>
            <div className="tips-list">
              <div className="tip-item">
                <div className="tip-dot"></div>
                <p>Complete 100% of your **skills manager profiles** to increase matching weights algorithm sets.</p>
              </div>
              <div className="tip-item">
                <div className="tip-dot"></div>
                <p>Don't forget to submit your weekly log hours every Friday afternoons reports sync triggers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
