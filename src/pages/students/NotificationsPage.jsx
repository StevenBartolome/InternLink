import React, { useState } from 'react';
import { userNotifications } from '../../data/mockData';
import { Bell, CheckCircle2, Info, AlertCircle, Inbox } from 'lucide-react';
import '../../assets/css/students/NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([...userNotifications]);
  const [activeTab, setActiveTab] = useState('All');

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'application': return <CheckCircle2 size={18} className="notify-icon success" />;
      case 'system': return <Info size={18} className="notify-icon info" />;
      default: return <AlertCircle size={18} className="notify-icon warning" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Applications') return n.type === 'application';
    if (activeTab === 'System') return n.type === 'system';
    return true; // All
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-container">
      <div className="page-header justify-between">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with system alerts and application updates.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-read-btn">
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-content">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['All', 'Unread', 'Applications', 'System'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
              {tab === 'All' && <span className="tab-badge secondary">{notifications.length}</span>}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-notifications">
              <Inbox size={48} className="empty-icon-notify" />
              <h3>No notifications found</h3>
              <p>You have no notifications in this category at the moment.</p>
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div 
                key={n.id} 
                className={`notification-item ${!n.read ? 'unread' : ''}`}
                onClick={() => toggleReadStatus(n.id)}
              >
                <div className="notify-left">
                  <div className={`icon-wrapper ${n.type}`}>
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="notify-info">
                    <p className="notify-message">{n.message}</p>
                    <span className="notify-time">{n.timestamp}</span>
                  </div>
                </div>
                {!n.read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
