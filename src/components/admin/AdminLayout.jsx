// src/components/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import '../../assets/css/admin/AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) setPageTitle('Dashboard');
    else if (path.includes('/admin/users')) setPageTitle('User Management');
    else if (path.includes('/admin/verification')) setPageTitle('Account Verification');
    else if (path.includes('/admin/oversight')) setPageTitle('Internship Oversight');
    else if (path.includes('/admin/matching')) setPageTitle('Matching Engine Settings');
    else if (path.includes('/admin/reports')) setPageTitle('System Reports');
    else if (path.includes('/admin/audit')) setPageTitle('Audit Logs');
    else if (path.includes('/admin/settings')) setPageTitle('System Settings');
    else if (path.includes('/admin/notifications')) setPageTitle('Notifications Center');
    else if (path.includes('/admin/login')) setPageTitle('Login');
  }, [location]);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
      )}

      <div className="layout-main">
        <Topbar toggleSidebar={toggleSidebar} title={pageTitle} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
