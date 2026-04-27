import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, User, Briefcase, FileCheck, 
  CheckSquare, Award, Bell, LogOut, GraduationCap, PlusSquare, Users, ChevronDown, ChevronUp,
  BarChart2
} from 'lucide-react';
import { studentProfile } from '../../../services/mocks/mockData';
import { companyProfile } from '../../../services/mocks/employerMockData';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 1024px)');

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
    { name: 'System Reports', path: '/admin/reports', icon: <BarChart2 size={18} /> },
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
    { name: 'Intern Progress', path: '/employer/progress', icon: <CheckSquare size={20} /> },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Browse Internships', path: '/internships', icon: <Briefcase size={20} /> },
    { name: 'My Applications', path: '/applications', icon: <FileCheck size={20} /> },
    { name: 'Internship Progress', path: '/progress', icon: <CheckSquare size={20} /> },
    { name: 'Grades & Evaluations', path: '/grades', icon: <Award size={20} /> },
  ];

  const brandName = isAdmin ? 'InternLink Admin' : isEmployer ? companyProfile.name : 'InternLink';

  const styles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: isMobile ? (isOpen ? '280px' : '0') : '260px',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      zIndex: 1000,
      transition: theme.transitions.default,
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: theme.shadows.lg,
    },
    brand: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '12px',
    },
    brandText: {
      fontSize: '1.25rem',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },
    nav: {
      flex: 1,
      padding: '0 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflowY: 'auto',
    },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      color: 'rgba(255, 255, 255, 0.8)',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: theme.transitions.default,
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    }),
    subLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px 10px 48px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      textDecoration: 'none',
      transition: theme.transitions.default,
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
    }),
    mobileToggle: {
      position: 'fixed',
      top: '16px',
      left: '16px',
      zIndex: 1100,
      backgroundColor: theme.colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '8px',
      display: isMobile ? 'flex' : 'none',
      cursor: 'pointer',
      boxShadow: theme.shadows.md,
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: isMobile && isOpen ? 'block' : 'none',
    }
  };

  return (
    <>
      <button style={styles.mobileToggle} onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div style={styles.backdrop} onClick={toggleSidebar}></div>

      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <GraduationCap size={24} />
          <span style={styles.brandText}>{brandName}</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item, index) => {
            if (item.subItems) {
              const isOpenMenu = openSubmenus[item.name];
              return (
                <div key={index}>
                  <div 
                    style={{ ...styles.navLink(false), cursor: 'pointer', justifyContent: 'space-between' }} 
                    onClick={() => toggleSubmenu(item.name)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {isOpenMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {isOpenMenu && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      {item.subItems.map((sub, sIndex) => (
                        <NavLink 
                          key={sIndex} 
                          to={sub.path} 
                          style={({ isActive }) => styles.subLink(isActive)}
                          onClick={() => isMobile && setIsOpen(false)}
                        >
                          {sub.name}
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
                style={({ isActive }) => styles.navLink(isActive)}
                onClick={() => isMobile && setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

