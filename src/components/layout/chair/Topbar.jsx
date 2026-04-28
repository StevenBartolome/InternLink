import React, { useState, useRef, useEffect } from 'react';
import { Bell, Grid, LogOut, User, Settings, CheckCircle } from 'lucide-react';
import { theme } from '../../../styles/theme';
import { useNavigate } from 'react-router-dom';
import Modal from '../../common/Modal/Modal';

const Topbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: 1, title: 'New Coordinator Added', time: '5 mins ago', read: false },
    { id: 2, title: 'Grade Finalization Required', time: '1 hour ago', read: false },
    { id: 3, title: 'OJT Cohort Updated', time: '2 hours ago', read: true },
  ];

  const handleLogout = () => {
    setIsModalOpen(false);
    localStorage.removeItem('internlink_session');
    navigate('/login');
  };

  const styles = {
    header: {
      height: '70px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '270px',
      zIndex: 900,
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: '#f1f5f9',
      transition: 'all 0.2s ease',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      backgroundColor: theme.colors.white,
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: `1px solid ${theme.colors.border}`,
      minWidth: '200px',
      zIndex: 1000,
      overflow: 'hidden',
    },
    notifItem: (read) => ({
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: read ? 'transparent' : 'rgba(56, 189, 248, 0.05)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }),
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      cursor: 'pointer',
      color: theme.colors.textMain,
      fontSize: '0.9rem',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#f1f5f9'
      }
    },
    logoutBtn: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.colors.textMuted,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: theme.colors.textMuted }}>
          <Grid size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>BS Information Technology</span>
        </div>
        <div style={styles.userSection}>
          <div style={{ position: 'relative' }} ref={notifRef}>
            <div 
              style={{ color: theme.colors.textMuted, cursor: 'pointer', position: 'relative', padding: '8px' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span style={{
                position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', 
                backgroundColor: theme.colors.danger, borderRadius: '50%'
              }}></span>
            </div>
            
            {showNotifications && (
              <div style={{...styles.dropdown, width: '300px'}}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.colors.border}`, fontWeight: 600 }}>
                  Notifications
                </div>
                <div>
                  {mockNotifications.map(notif => (
                    <div key={notif.id} style={styles.notifItem(notif.read)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: notif.read ? 500 : 600 }}>{notif.title}</span>
                        {!notif.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.colors.primary }}></div>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{notif.time}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.85rem', color: theme.colors.primary, cursor: 'pointer' }}>
                  Mark all as read
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={profileRef}>
            <div style={styles.profile} onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div style={styles.avatar}>PC</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.colors.textMain }}>Program Chair</span>
            </div>

            {showProfileMenu && (
              <div style={styles.dropdown}>
                <div 
                  style={{...styles.dropdownItem, borderBottom: `1px solid ${theme.colors.border}`}}
                  onClick={() => { setShowProfileMenu(false); navigate('/chair/profile'); }}
                >
                  <User size={16} /> My Profile
                </div>
                <div style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                  <Settings size={16} /> Settings
                </div>
              </div>
            )}
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
