import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, CheckSquare, Clock, Plus, ArrowRight } from 'lucide-react';
import { internshipListings, applicants, activeInterns } from '../../data/employerMockData';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import '../../assets/css/employer/DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Stats
  const totalListings = internshipListings.length;
  const totalApplicants = applicants.length;
  const activeInternCount = activeInterns.length;
  const pendingApps = applicants.filter(a => a.status === 'Pending').length;

  const recentApplicants = applicants.slice(0, 5);
  const topInterns = activeInterns.slice(0, 3);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome Back, Accenture</h1>
          <p className="subtitle">Here is what is happening with your internships today.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/employer/post')}>
            <Plus size={18} /> Post New Internship
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg bg-green">
            <Briefcase size={24} className="stat-icon text-green" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalListings}</span>
            <span className="stat-label">Total Listings</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-bg bg-blue">
            <Users size={24} className="stat-icon text-blue" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalApplicants}</span>
            <span className="stat-label">Total Applicants</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg bg-purple">
            <CheckSquare size={24} className="stat-icon text-purple" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeInternCount}</span>
            <span className="stat-label">Active Interns</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg bg-orange">
            <Clock size={24} className="stat-icon text-orange" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{pendingApps}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Recent Applications */}
        <div className="grid-card">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <button className="btn-link" onClick={() => navigate('/employer/applicants')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Position</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplicants.map(app => (
                    <tr key={app.id}>
                      <td>
                        <span className="font-semibold">{app.studentName}</span>
                        <div className="sub-text">{app.course}</div>
                      </td>
                      <td>{app.position}</td>
                      <td>{app.dateApplied}</td>
                      <td><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Active Internships */}
        <div className="grid-card">
          <div className="card-header">
            <h3>Active Internships</h3>
            <button className="btn-link" onClick={() => navigate('/employer/progress')}>
              Track Progress <ArrowRight size={16} />
            </button>
          </div>
          <div className="card-body">
            <div className="intern-list">
              {topInterns.map(intern => {
                const percentage = (intern.hoursCompleted / intern.totalHours) * 100;
                return (
                  <div key={intern.id} className="intern-item">
                    <div className="intern-info">
                      <div>
                        <span className="font-semibold">{intern.studentName}</span>
                        <div className="sub-text">{intern.position}</div>
                      </div>
                      <span className="hours-text">{intern.hoursCompleted} / {intern.totalHours} hrs</span>
                    </div>
                    <ProgressBar percentage={percentage} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
