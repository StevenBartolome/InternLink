import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, GraduationCap, Briefcase, User } from 'lucide-react';
import { userNotifications, studentProfile } from '../../data/mockData';
import { notifications as employerNotifications, companyProfile } from '../../data/employerMockData';
import { adminProfile } from '../../data/adminMockData';
import Modal from '../Modal/Modal';
import '../../assets/css/students/Topbar.css';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isEmployer = location.pathname.startsWith('/employer');
  const isAdmin = location.pathname.startsWith('/admin');

  const getTitle = (path) => {
    if (isAdmin) {
      if (path.startsWith('/admin/users')) return 'User Management';
      if (path.startsWith('/admin/verification')) return 'Account Verification';
      if (path.startsWith('/admin/oversight')) return 'Internship Oversight';
      if (path.startsWith('/admin/matching')) return 'Matching Engine';
      if (path.startsWith('/admin/reports')) return 'System Reports';
      if (path.startsWith('/admin/audit')) return 'Audit Logs';
      if (path.startsWith('/admin/settings')) return 'System Settings';
      if (path.startsWith('/admin/profile')) return 'Admin Profile';
      return 'Admin Dashboard';
    }

    if (isEmployer) {
      if (path.startsWith('/employer/listings')) return 'Manage Listings';
      if (path.startsWith('/employer/post')) return 'Post Internship';
      if (path.startsWith('/employer/applicants')) return 'Applicant Review';
      if (path.startsWith('/employer/approvals')) return 'Application Approval';
      if (path.startsWith('/employer/progress')) return 'Intern Progress';
      if (path.startsWith('/employer/evaluations')) return 'Grade & Evaluate';
      if (path.startsWith('/employer/notifications')) return 'Notifications';
      if (path.startsWith('/employer/profile')) return 'Company Profile';
      return 'Employer Dashboard';
    }

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

  const notifications = isAdmin ? [] : isEmployer ? employerNotifications : userNotifications;
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleLogout = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  const profileData = isAdmin ? {
    name: adminProfile.name,
    avatar: adminProfile.avatar,
    role: "Admin"
  } : isEmployer ? {
    name: companyProfile.name,
    avatar: companyProfile.logo,
    role: "Employer"
  } : {
    name: studentProfile.name,
    avatar: studentProfile.avatar,
    role: "Student"
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
            {isAdmin ? <Briefcase size={20} className="hat-icon text-red-500" /> : isEmployer ? <Briefcase size={20} className="hat-icon" /> : <GraduationCap size={20} className="hat-icon" />}
            <span>InternLink</span>
          </div>

          <div className="topbar-divider"></div>

          <div className="notification-bell" onClick={() => navigate(isEmployer ? '/employer/notifications' : '/notifications')}>
            <Bell size={21} className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          <div className="topbar-divider"></div>

          <div className="topbar-profile" onClick={() => navigate(isAdmin ? '/admin/profile' : isEmployer ? '/employer/profile' : '/profile')}>
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="topbar-avatar" />
            ) : (
              <div className="topbar-avatar-placeholder"><User size={20} /></div>
            )}
            <div className="topbar-user-info">
              <span className="user-name">{profileData.name}</span>
              <span className="user-role">{profileData.role}</span>
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
