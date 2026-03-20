import React, { useState } from 'react';
import { Bell, Check, UserPlus, Award, AlertCircle } from 'lucide-react';
import { notifications as initialNotifications } from '../../../data/employerMockData';
import '../../../assets/css/employer/NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('All');

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Applicant': return <UserPlus size={18} className="icon-blue" />;
      case 'Evaluation': return <Award size={18} className="icon-green" />;
      case 'System': return <AlertCircle size={18} className="icon-orange" />;
      default: return <Bell size={18} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="subtitle">Stay updated on applicants and intern progress.</p>
        </div>
        <button className="btn-link" onClick={handleMarkAllRead}>
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="notifications-tabs">
        {['All', 'Unread', 'Applicant', 'Evaluation', 'System'].map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="item-icon">
                {getIcon(notification.type)}
              </div>
              <div className="item-content">
                <p className="item-message">{notification.message}</p>
                <span className="item-time">{notification.timestamp}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
