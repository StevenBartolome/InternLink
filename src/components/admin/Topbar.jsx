// src/components/admin/Topbar.jsx
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { adminProfile } from '../../data/adminMockData';
import '../../assets/css/admin/Topbar.css';

const Topbar = ({ toggleSidebar, title }) => {
  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="admin-profile-pill">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="profile-info">
            <span className="profile-name">{adminProfile.name}</span>
            <span className="profile-role">{adminProfile.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
