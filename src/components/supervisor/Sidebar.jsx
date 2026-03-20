// src/components/supervisor/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CheckSquare, 
  FileEdit, 
  Bell, 
  LogOut, 
  GraduationCap 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/supervisor/interns', icon: Users, label: 'My Interns' },
    { path: '/supervisor/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/supervisor/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/supervisor/evaluation', icon: FileEdit, label: 'Evaluation' },
    { path: '/supervisor/notifications', icon: Bell, label: 'Notifications' },
  ];

  const handleLogout = () => {
    // Clear any auth state if exists
    navigate('/login');
  };

  return (
    <aside className={`supervisor-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <GraduationCap size={28} color="#0284c7" />
          <span>InternLink</span>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          &times;
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (window.innerWidth <= 768) {
                toggleSidebar();
              }
            }}
          >
            <item.icon size={20} className="nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Removed */}
    </aside>
  );
};

export default Sidebar;
