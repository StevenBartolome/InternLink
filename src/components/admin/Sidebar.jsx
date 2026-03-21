// src/components/admin/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart2, Users, CheckCircle, Briefcase, 
  Settings2, FileText, Settings, Bell, Home, X 
} from 'lucide-react';
import '../../assets/css/admin/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: <Home size={20} /> },
    { title: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { title: 'Account Verification', path: '/admin/verification', icon: <CheckCircle size={20} /> },
    { title: 'Internship Oversight', path: '/admin/oversight', icon: <Briefcase size={20} /> },
    { title: 'Matching Engine', path: '/admin/matching', icon: <Settings2 size={20} /> },
    { title: 'System Reports', path: '/admin/reports', icon: <BarChart2 size={20} /> },
    { title: 'Audit Logs', path: '/admin/audit', icon: <FileText size={20} /> },
    { title: 'System Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    { title: 'Notifications Center', path: '/admin/notifications', icon: <Bell size={20} /> },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <Briefcase size={28} className="logo-icon" />
          <span className="logo-text">InternLink <span className="logo-role">Admin</span></span>
        </div>
        <button className="close-sidebar-btn" onClick={toggleSidebar}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-title">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
