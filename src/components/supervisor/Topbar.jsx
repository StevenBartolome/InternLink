// src/components/supervisor/Topbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { supervisorData } from '../../data/supervisorMockData';
import Modal from '../Modal/Modal';
import './Topbar.css';

const Topbar = ({ toggleSidebar, title }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    setIsModalOpen(false);
    navigate('/login');
  };
  return (
    <header className="supervisor-topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" onClick={() => navigate('/supervisor/notifications')}>
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>
        
        <div className="topbar-divider"></div>
        
        <div className="user-profile" onClick={() => navigate('/supervisor/profile')} style={{ cursor: 'pointer' }}>
          <img 
            src={supervisorData.avatar} 
            alt={supervisorData.name} 
            className="user-avatar" 
          />
          <div className="user-info">
            <span className="user-name">{supervisorData.name}</span>
            <span className="user-role">{supervisorData.role}</span>
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
