// src/pages/supervisor/NotificationsPage/NotificationsPage.jsx
import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, LogIn, FileText, Users, Check } from 'lucide-react';
import { notificationsData } from '../../../data/supervisorMockData';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(notificationsData);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'log-in': return <LogIn size={18} className="notif-icon primary" />;
      case 'check-circle': return <CheckCircle2 size={18} className="notif-icon success" />;
      case 'alert-circle': return <AlertCircle size={18} className="notif-icon danger" />;
      case 'file-text': return <FileText size={18} className="notif-icon purple" />;
      case 'users': return <Users size={18} className="notif-icon blue" />;
      default: return <Bell size={18} className="notif-icon" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleReadClick = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return !n.read; // Unread
  });

  return (
    <div className="supervisor-page-container">
      <div className="page-header flex-between">
        <div className="header-titles">
          <h2 className="title">Notifications</h2>
          <p className="subtitle">Stay updated with your interns' activities</p>
        </div>
        <button className="mark-read-btn" onClick={markAllAsRead}>
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="card-supervisor notifications-card">
        <div className="tabs-bar">
          <button 
            className={`tab-item ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => setActiveTab('All')}
          >
            All Notifications
          </button>
          <button 
            className={`tab-item ${activeTab === 'Unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('Unread')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        <div className="notif-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} color="var(--text-secondary)" opacity={0.5} />
              <p>No new notifications.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => handleReadClick(notif.id)}
              >
                <div className="notif-icon-wrapper">
                  {getIcon(notif.icon)}
                </div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{notif.timestamp}</span>
                </div>
                {!notif.read && <span className="notif-dot"></span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
