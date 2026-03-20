import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, GraduationCap } from 'lucide-react';
import { userNotifications, studentProfile } from '../data/mockData';
import Modal from './Modal/Modal';
import './Topbar.css';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getTitle = (path) => {
    if (path.startsWith('/internships/')) return 'Internship Details';
    switch(path) {
      case '/dashboard': return 'Student Dashboard';
      case '/profile': return 'My Profile';
      case '/internships': return 'Browse Internships';
      case '/applications': return 'My Applications';
      case '/progress': return 'Internship Progress';
      case '/grades': return 'Grades & Evaluations';
      case '/notifications': return 'Notifications';
      default: return 'Overview';
    }
  };

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h2>{getTitle(location.pathname)}</h2>
        </div>
        
        <div className="topbar-right">
          {/* Topbar Brand link with Hat */}
          <div className="topbar-brand-mini">
            <GraduationCap size={20} className="hat-icon" />
            <span>InternLink</span>
          </div>

          <div className="topbar-divider"></div>

          <div className="notification-bell" onClick={() => navigate('/notifications')}>
            <Bell size={21} className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          <div className="topbar-divider"></div>

          <div className="topbar-profile" onClick={() => navigate('/profile')}>
            <img src={studentProfile.avatar} alt="Avatar" className="topbar-avatar" />
            <div className="topbar-user-info">
              <span className="user-name">{studentProfile.name}</span>
              <span className="user-role">Student</span>
            </div>
          </div>

          <button className="topbar-logout-btn" onClick={() => setIsModalOpen(true)} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isConfirm={true}
        onConfirm={handleLogout}
        title="Confirm Logout" 
        message="Are you sure you want to sign out of InternLink?" 
        type="warning" 
      />
    </>
  );
};

export default Topbar;
