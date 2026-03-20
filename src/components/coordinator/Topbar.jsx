import React, { useState } from 'react';
import { Bell, Menu, LogOut, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coordinatorProfile } from '../../data/coordinatorMockData';
import Modal from '../Modal/Modal';
import '../../assets/css/coordinator/Topbar.css';

const Topbar = ({ title, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  return (
    <header className="coordinator-topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-brand-mini">
          <GraduationCap size={20} className="hat-icon" />
          <span>InternLink</span>
        </div>

        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>

        <div className="topbar-divider"></div>

        <div className="user-profile" onClick={() => navigate('/coordinator/profile')}>
          <img 
            src={coordinatorProfile.avatar} 
            alt={coordinatorProfile.name} 
            className="user-avatar"
          />
          <div className="user-info">
            <span className="user-name">{coordinatorProfile.name}</span>
            <span className="user-role">{coordinatorProfile.role}</span>
          </div>
        </div>

        <button className="topbar-logout-btn" onClick={() => setIsModalOpen(true)} title="Logout">
          <LogOut size={20} />
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isConfirm={true}
        onConfirm={handleLogout}
        title="Confirm Logout" 
        message="Are you sure you want to sign out of InternLink?" 
        type="warning" 
      />
    </header>
  );
};

export default Topbar;
