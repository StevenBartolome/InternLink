import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, User, Briefcase, FileCheck, 
  CheckSquare, Award, Bell, LogOut, GraduationCap, PlusSquare, Users, UserPlus, ChevronDown, ChevronUp,
  BarChart2
} from 'lucide-react';
import { studentProfile } from '../../data/mockData';
import { companyProfile } from '../../data/employerMockData';
import { adminProfile } from '../../data/adminMockData';
import '../../assets/css/students/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const location = useLocation();

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isAdmin = location.pathname.startsWith('/admin');
  const isEmployer = !isAdmin && location.pathname.startsWith('/employer');

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Account Verification', path: '/admin/verification', icon: <FileCheck size={20} /> },
    { name: 'Internship Oversight', path: '/admin/oversight', icon: <Briefcase size={20} /> },
    // Matching is Settings2?
    { name: 'System Reports', path: '/admin/reports', icon: <BarChart2 size={18} /> }, // Wait, layout icon setup
    { name: 'Audit Logs', path: '/admin/audit', icon: <FileCheck size={20} /> }
  ] : isEmployer ? [
    { name: 'Dashboard', path: '/employer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Listings', path: '/employer/listings', icon: <Briefcase size={20} /> },
    { name: 'Post Internship', path: '/employer/post', icon: <PlusSquare size={20} /> },
    { name: 'Applicant Review', path: '/employer/applicants', icon: <Users size={20} /> },
    { 
      name: 'Supervisors', 
      icon: <Users size={20} />, 
      subItems: [
        { name: 'Manage Supervisors', path: '/employer/supervisors' },
        { name: 'Assign Supervisor', path: '/employer/assign-supervisor' }
      ]
    },
    { name: 'Approvals', path: '/employer/approvals', icon: <FileCheck size={20} /> },
    { name: 'Intern Progress', path: '/employer/progress', icon: <CheckSquare size={20} /> },
    { name: 'Notifications', path: '/employer/notifications', icon: <Bell size={20} /> },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Browse Internships', path: '/internships', icon: <Briefcase size={20} /> },
    { name: 'My Applications', path: '/applications', icon: <FileCheck size={20} /> },
    { name: 'Internship Progress', path: '/progress', icon: <CheckSquare size={20} /> },
    { name: 'Grades & Evaluations', path: '/grades', icon: <Award size={20} /> },
  ];

  const brandName = isAdmin ? 'InternLink Admin' : isEmployer ? companyProfile.name : 'InternLink';

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
          {isEmployer ? (
            <div className="company-logo-sidebar">
              {companyProfile.logo ? (
                <img src={companyProfile.logo} alt="Logo" className="sidebar-logo-img" />
              ) : (
                <Briefcase size={22} className="hat-icon" />
              )}
            </div>
          ) : (
            <GraduationCap size={22} className="hat-icon" />
          )}
          <span className="sidebar-logo-text">{brandName}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.subItems) {
              const isOpenMenu = openSubmenus[item.name];
              return (
                <div key={index} className="submenu-container">
                  <div className="nav-link submenu-header" onClick={() => toggleSubmenu(item.name)}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.name}</span>
                    <span className="submenu-arrow">
                      {isOpenMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                  {isOpenMenu && (
                    <div className="submenu-list">
                      {item.subItems.map((sub, sIndex) => (
                        <NavLink 
                          key={sIndex} 
                          to={sub.path} 
                          className={({ isActive }) => `nav-link sub-link ${isActive ? 'active' : ''}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="nav-text">{sub.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink 
                key={index} 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </NavLink>
            );
          })}
          {isEmployer && (
            <NavLink 
              to="/employer/profile" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon"><User size={20} /></span>
              <span className="nav-text">Company Profile</span>
            </NavLink>
          )}
        </nav>

        {/* Footer Removed */}
      </div>
    </>
  );
};

export default Sidebar;
