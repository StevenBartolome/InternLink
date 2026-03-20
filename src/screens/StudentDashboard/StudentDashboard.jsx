import React, { useState } from 'react';
import './StudentDashboard.css';
import Sidebar from './components/Sidebar';
import Overview from './tabs/Overview';
import BrowseInternships from './tabs/BrowseInternships';
import Applications from './tabs/Applications';
import ProfileDashboard from './tabs/ProfileDashboard';

const StudentDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user] = useState({
    name: 'Juan Dela Cruz',
    role: 'Student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan'
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview /> ;
      case 'internships':
        return <BrowseInternships /> ;
      case 'applications':
        return <Applications /> ;
      case 'profile':
        return <ProfileDashboard /> ;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => onNavigate('landing')} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <p>Here is what is happening with your internship search today.</p>
          </div>
          <div className="header-right">
            <div className="user-profile" onClick={() => setActiveTab('profile')} title="Go to Profile">
              <img src={user.avatar} alt="Profile" className="avatar" />
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
            <button className="logout-icon-btn" onClick={() => onNavigate('landing')} title="Logout">
              🚪
            </button>
          </div>

        </header>
        <main className="dashboard-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
