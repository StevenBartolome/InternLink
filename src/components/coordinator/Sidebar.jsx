import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  Activity, 
  Award, 
  Cpu, 
  FileSpreadsheet, 
  BarChart2, 
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import '../../assets/css/coordinator/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { path: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/coordinator/students', icon: Users, label: 'Student Directory' },
    { path: '/coordinator/applications', icon: FileText, label: 'Application Tracking' },
    { path: '/coordinator/approvals', icon: CheckSquare, label: 'Internship Approval' },
    { path: '/coordinator/progress', icon: Activity, label: 'Progress Monitoring' },
    { path: '/coordinator/grades', icon: Award, label: 'Grade Management' },
    { path: '/coordinator/matching', icon: Cpu, label: 'Automated Matching' },
    { path: '/coordinator/evaluation', icon: FileSpreadsheet, label: 'Student Evaluation' },
    { path: '/coordinator/reports', icon: BarChart2, label: 'Reports' },
  ];

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`coordinator-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">IL</div>
            <span className="logo-text">InternLink</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavLink 
              key={index} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              <item.icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
