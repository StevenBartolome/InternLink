import React, { useState } from 'react';
import { Bell, Check, Filter, AlertCircle, FileText, Activity } from 'lucide-react';
import { mockNotifications } from '../../../data/coordinatorMockData';
import '../../../assets/css/coordinator/NotificationsPage.css';

const NotificationsPage = () => {
  const [activeTab, setActiveTab ] = useState('All');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    return n.type === activeTab;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Application': return <FileText size={20} className="icon-app" />;
      case 'Listing': return <AlertCircle size={20} className="icon-list" />;
      case 'Progress': return <Activity size={20} className="icon-prog" />;
      default: return <Bell size={20} className="icon-def" />;
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header-actions">
        <button className="coordinator-btn coordinator-btn-secondary btn-sm" onClick={markAllAsRead}>
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="notifications-tabs">
        {['All', 'Unread', 'Application', 'Listing', 'Progress'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Application' ? 'Applications' : tab === 'Listing' ? 'Listings' : tab === 'Progress' ? 'Progress' : tab}
            <span className="tab-count">
              {tab === 'All' ? notifications.length : 
               tab === 'Unread' ? notifications.filter(n => !n.read).length :
               notifications.filter(n => n.type === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="notifications-list coordinator-card">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-icon" />
            <p>No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div 
              key={n.id} 
              className={`notification-item ${n.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="notif-icon-wrapper">
                {getIcon(n.type)}
              </div>
              <div className="notif-content">
                <p className="notif-message">{n.message}</p>
                <span className="notif-time">{n.timestamp}</span>
              </div>
              {!n.read && <span className="unread-dot"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
