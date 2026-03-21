// src/pages/admin/DashboardPage.jsx
import React from 'react';
import { Users, CheckCircle, Briefcase, AlertTriangle, ArrowRight, UserPlus, FileText, Bell } from 'lucide-react';
import { adminProfile, dashboardStats, auditLogs } from '../../data/adminMockData';
import StatCard from '../../components/StatCard';
import '../../assets/css/admin/DashboardPage.css';

const DashboardPage = () => {
  const { totalUsers, pendingVerifications, activeInternships, systemAlerts, roleDistribution } = dashboardStats;

  // Get top 5 recent audit logs
  const recentActivity = auditLogs.slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* Welcome Card */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {adminProfile.name}!</h1>
          <p>System: <strong>{adminProfile.systemName}</strong></p>
          <p className="welcome-subtext">Monitor and manage the OJT program from this central hub.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          icon={Users} 
          color="primary" 
          trend={{ type: 'up', value: '12%', label: 'this month' }} 
        />
        <StatCard 
          title="Pending Verifications" 
          value={pendingVerifications} 
          icon={CheckCircle} 
          color="warning" 
        />
        <StatCard 
          title="Active Internships" 
          value={activeInternships} 
          icon={Briefcase} 
          color="success" 
        />
        <StatCard 
          title="System Alerts" 
          value={systemAlerts} 
          icon={AlertTriangle} 
          color="danger" 
        />
      </div>

      {/* Action Buttons */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            <CheckCircle size={18} /> Verify Accounts
          </button>
          <button className="action-btn">
            <FileText size={18} /> View Reports
          </button>
          <button className="action-btn btn-primary">
            <Bell size={18} /> Broadcast Announcement
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Grid */}
      <div className="dashboard-grid">
        {/* Role Distribution */}
        <div className="dashboard-card role-distribution">
          <div className="card-header">
            <h3>Role Distribution</h3>
          </div>
          <div className="card-content">
            <div className="distribution-list">
              <div className="distribution-item">
                <div className="item-label"><span className="dot student"></span> Students</div>
                <div className="item-value">{roleDistribution.students}</div>
              </div>
              <div className="distribution-item">
                <div className="item-label"><span className="dot employer"></span> Employers</div>
                <div className="item-value">{roleDistribution.employers}</div>
              </div>
              <div className="distribution-item">
                <div className="item-label"><span className="dot supervisor"></span> Supervisors</div>
                <div className="item-value">{roleDistribution.supervisors}</div>
              </div>
              <div className="distribution-item">
                <div className="item-label"><span className="dot coordinator"></span> Coordinators</div>
                <div className="item-value">{roleDistribution.coordinators}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card recent-activity">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="view-all-btn">View All <ArrowRight size={16} /></button>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivity.map((log) => (
                <div key={log.id} className="activity-item">
                  <div className={`activity-icon-badge ${log.type.toLowerCase()}`}>
                    {log.type === 'Create' && <UserPlus size={16} />}
                    {log.type === 'Update' && <FileText size={16} />}
                    {log.type === 'System' && <AlertTriangle size={16} />}
                    {(log.type === 'Login' || log.type === 'Delete') && <Users size={16} />}
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">
                      <strong>{log.user}</strong> ({log.role}) {log.action.toLowerCase()}
                    </p>
                    <span className="activity-time">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
