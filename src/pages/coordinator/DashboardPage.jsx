import { Users, FileCheck, AlertCircle, FileText, ArrowRight, Activity, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/coordinator/StatCard';
import { coordinatorProfile, mockNotifications, mockStudents, mockEmployerListings } from '../../data/coordinatorMockData';
import '../../assets/css/coordinator/DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const stats = [
    { title: "Total Students", value: mockStudents.length, icon: Users, color: "primary" },
    { title: "Active Placements", value: mockStudents.filter(s => s.status === 'Placed').length, icon: FileCheck, color: "success" },
    { title: "Pending Approvals", value: mockEmployerListings.filter(l => l.status === 'Pending').length, icon: AlertCircle, color: "warning" },
    { title: "Evaluations Due", value: 4, icon: FileText, color: "info" } // Mock value for simplicity
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Card */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {coordinatorProfile.name}!</h2>
          <p>{coordinatorProfile.school} • {coordinatorProfile.department}</p>
        </div>
        <div className="quick-actions">
          <button className="dashboard-btn dashboard-btn-primary" onClick={() => navigate('/coordinator/approvals')}>
            Review Listings
          </button>
          <button className="dashboard-btn dashboard-btn-secondary" onClick={() => navigate('/coordinator/reports')}>
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card activity-feed">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn-link">View All <ArrowRight size={16} /></button>
          </div>
          <div className="feed-list">
            {mockNotifications.map((notif) => (
              <div key={notif.id} className={`feed-item ${notif.read ? 'read' : 'unread'}`}>
                <div className="feed-icon">
                  {notif.type === 'Application' && <FileText size={16} />}
                  {notif.type === 'Listing' && <AlertCircle size={16} />}
                  {notif.type === 'Progress' && <Activity size={16} />}
                  {!['Application', 'Listing', 'Progress'].includes(notif.type) && <AlertCircle size={16} />}
                </div>
                <div className="feed-content">
                  <p className="feed-message">{notif.message}</p>
                  <span className="feed-time">{notif.timestamp}</span>
                </div>
                {!notif.read && <span className="unread-dot"></span>}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="dashboard-card shortcuts-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="shortcuts-grid">
            <button className="shortcut-item" onClick={() => navigate('/coordinator/students')}>
              <Users size={24} />
              <span>View Students</span>
            </button>
            <button className="shortcut-item" onClick={() => navigate('/coordinator/approvals')}>
              <FileCheck size={24} />
              <span>Approve Listings</span>
            </button>
            <button className="shortcut-item" onClick={() => navigate('/coordinator/applications')}>
              <FileText size={24} />
              <span>Track Applications</span>
            </button>
            <button className="shortcut-item" onClick={() => navigate('/coordinator/reports')}>
              <BarChart2 size={24} />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
