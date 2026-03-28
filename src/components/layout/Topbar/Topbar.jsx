import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, GraduationCap, Briefcase, User } from 'lucide-react';
import { userNotifications, studentProfile } from '../../../services/mocks/mockData';
import { notifications as employerNotifications, companyProfile } from '../../../services/mocks/employerMockData';
import { adminProfile } from '../../../services/mocks/adminMockData';
import Modal from '../../common/Modal/Modal';
import { theme } from '../../../styles/theme';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
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
    localStorage.removeItem('internlink_session');
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

  const styles = {
    topbar: {
      height: '70px',
      backgroundColor: theme.colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px 0 60px' : '0 24px',
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      position: 'sticky',
      top: 0,
      zIndex: 900,
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      h2: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: theme.colors.textMain,
        margin: 0,
      }
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    notification: {
      position: 'relative',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: theme.transitions.default,
    },
    badge: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      backgroundColor: theme.colors.danger,
      color: '#fff',
      fontSize: '10px',
      fontWeight: 'bold',
      minWidth: '16px',
      height: '16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '12px',
      transition: theme.transitions.default,
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      objectFit: 'cover',
    },
    avatarPlaceholder: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userInfo: {
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
    },
    username: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    userrole: {
      fontSize: '0.75rem',
      color: theme.colors.textMuted,
    },
    logoutBtn: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.colors.textMuted,
      cursor: 'pointer',
      transition: theme.transitions.default,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <>
      <header style={styles.topbar}>
        <div style={styles.left}>
          <h2 style={styles.left.h2}>{getTitle(location.pathname)}</h2>
        </div>
        
        <div style={styles.right}>
          <div 
            style={styles.notification} 
            onClick={() => navigate(isEmployer ? '/employer/notifications' : '/notifications')}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </div>

          <div 
            style={styles.profile} 
            onClick={() => navigate(isAdmin ? '/admin/profile' : isEmployer ? '/employer/profile' : '/profile')}
          >
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}><User size={20} /></div>
            )}
            <div style={styles.userInfo}>
              <span style={styles.username}>{profileData.name}</span>
              <span style={styles.userrole}>{profileData.role}</span>
            </div>
          </div>

          <button style={styles.logoutBtn} onClick={() => setIsModalOpen(true)} title="Logout">
            <LogOut size={20} />
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

