import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, User, Briefcase, FileCheck, 
  CheckSquare, Award, Bell, LogOut, GraduationCap 
} from 'lucide-react';
import { studentProfile } from '../data/mockData';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Browse Internships', path: '/internships', icon: <Briefcase size={20} /> },
    { name: 'My Applications', path: '/applications', icon: <FileCheck size={20} /> },
    { name: 'Internship Progress', path: '/progress', icon: <CheckSquare size={20} /> },
    { name: 'Grades & Evaluations', path: '/grades', icon: <Award size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <GraduationCap size={22} className="hat-icon" />
          <span className="sidebar-logo-text">InternLink</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavLink 
              key={index} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)} // close sidebar on mobile click
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Removed */}
      </div>
    </>
  );
};

export default Sidebar;
