// src/pages/supervisor/DashboardPage/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, Briefcase, FileSignature, ArrowRight } from 'lucide-react';
import { supervisorData, internsData, statsSummary } from '../../data/supervisorMockData';
import StatusBadge from '../../components/supervisor/StatusBadge';
import ProgressBar from '../../components/supervisor/ProgressBar';
import '../../assets/css/supervisor/DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const statCards = [
    { title: 'Total Assigned Interns', value: statsSummary.totalInterns, icon: Users, color: 'blue' },
    { title: 'Present Today', value: statsSummary.presentToday, icon: CalendarClock, color: 'green' },
    { title: 'Pending Tasks', value: statsSummary.pendingTasks, icon: Briefcase, color: 'amber' },
    { title: 'Evaluations Due', value: statsSummary.evaluationsDue, icon: FileSignature, color: 'purple' },
  ];

  return (
    <div className="supervisor-page-container">
      {/* Welcome Card */}
      <div className="welcome-card card-supervisor">
        <div className="welcome-content">
          <span className="welcome-label">Welcome back,</span>
          <h2 className="welcome-name">{supervisorData.name}</h2>
          <p className="welcome-sub">
            {supervisorData.company} &bull; {supervisorData.department}
          </p>
        </div>
        <div className="welcome-illustration">
          {/* Subtle decoration or quote */}
          <div className="quote">"Managing talents, building the future."</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card card-supervisor">
            <div className={`stat-icon-wrapper ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-title">{stat.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Interns & Quick Actions */}
      <div className="dashboard-grid">
        {/* Intern List Preview */}
        <div className="dashboard-section card-supervisor">
          <div className="section-header">
            <h3>Assigned Interns</h3>
            <button className="text-btn" onClick={() => navigate('/supervisor/interns')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="intern-list-preview">
            {internsData.map((intern) => (
              <div key={intern.id} className="intern-preview-item" onClick={() => navigate(`/supervisor/interns/${intern.id}`)}>
                <img src={intern.photo} alt={intern.name} className="intern-photo-sm" />
                <div className="intern-info-sm">
                  <span className="intern-name-sm">{intern.name}</span>
                  <span className="intern-school-sm">{intern.school}</span>
                </div>
                <div className="intern-status-sm">
                  <StatusBadge status={intern.todayStatus} />
                </div>
                <div className="intern-progress-sm">
                  <ProgressBar rendered={intern.renderedHours} required={intern.requiredHours} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section card-supervisor">
          <div className="section-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-list">
            <button className="action-btn primary" onClick={() => navigate('/supervisor/attendance')}>
              <CalendarClock size={20} />
              <div className="action-text">
                <span>Log Attendance</span>
                <p>Time In/Out or manual correction</p>
              </div>
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/supervisor/tasks')}>
              <Briefcase size={20} />
              <div className="action-text">
                <span>Manage Tasks</span>
                <p>Assign and update intern tasks</p>
              </div>
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/supervisor/evaluation')}>
              <FileSignature size={20} />
              <div className="action-text">
                <span>Evaluate Intern</span>
                <p>Submit performance review</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
