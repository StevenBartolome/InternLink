// src/pages/admin/NotificationsCenterPage.jsx
import React, { useState } from 'react';
import { Bell, Send, CheckCircle, Info, MessageSquare, Megaphone, Trash2 } from 'lucide-react';
import { notificationsList, sentAnnouncements } from '../../data/adminMockData';
import '../../assets/css/admin/NotificationsCenterPage.css';

const NotificationsCenterPage = () => {
  const [notifications, setNotifications] = useState(notificationsList);
  const [announcements, setAnnouncements] = useState(sentAnnouncements);
  const [activeTab, setActiveTab] = useState('All');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('All');

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    const newAnnouncement = {
      id: announcements.length + 1,
      title,
      target,
      dateSent: new Date().toISOString().split('T')[0],
      sentBy: "Juan dela Cruz"
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle('');
    setMessage('');
    setTarget('All');
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    return n.type === activeTab.toLowerCase();
  });

  return (
    <div className="notifications-center-page">
      <div className="notifications-grid">
        {/* Left: Broadcast Form & History */}
        <div className="grid-left">
          <div className="notify-card broadcast-card">
            <div className="card-header">
              <Megaphone size={20} className="header-icon" />
              <h3>Broadcast Announcement</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleSendAnnouncement} className="broadcast-form">
                <div className="form-group">
                  <label>Announcement Title</label>
                  <input type="text" placeholder="e.g. System Maintenance Schedule" required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows="4" placeholder="Write your message here..." required value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'none' }} />
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select value={target} onChange={e => setTarget(e.target.value)}>
                    <option value="All">All Users</option>
                    <option value="Students">Students Only</option>
                    <option value="Employers">Employers Only</option>
                    <option value="Coordinators">Coordinators Only</option>
                  </select>
                </div>
                <button type="submit" className="send-btn">
                  <Send size={18} /> Send Announcement
                </button>
              </form>
            </div>
          </div>

          <div className="notify-card sent-history-card">
            <div className="card-header">
              <MessageSquare size={20} className="header-icon" />
              <h3>Sent Announcements</h3>
            </div>
            <div className="card-content table-responsive">
              <table className="announcements-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Target</th>
                    <th>Date Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map(ann => (
                    <tr key={ann.id}>
                      <td className="text-bold">{ann.title}</td>
                      <td>
                        <span className={`target-badge ${ann.target.toLowerCase()}`}>{ann.target}</span>
                      </td>
                      <td className="date-cell">{ann.dateSent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: System Notifications Inbox */}
        <div className="grid-right">
          <div className="notify-card inbox-card">
            <div className="card-header">
              <div className="header-left">
                <Bell size={20} className="header-icon" />
                <h3>System Notifications</h3>
              </div>
              <button className="mark-read-btn" onClick={handleMarkAllRead}>Mark all as read</button>
            </div>
            
            <div className="inbox-tabs">
              {['All', 'Unread', 'System', 'Announcement'].map(tab => (
                <button key={tab} className={`inbox-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="card-content inbox-content">
              {filteredNotifications.length === 0 ? (
                <div className="empty-inbox">
                  <CheckCircle size={40} className="empty-icon" />
                  <p>All caught up! No notifications found.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {filteredNotifications.map(n => (
                    <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                      <div className={`notification-icon ${n.type}`}>
                        <Info size={18} />
                      </div>
                      <div className="notification-details">
                        <p className="notification-msg">{n.message}</p>
                        <span className="notification-time">{n.timestamp}</span>
                      </div>
                      {!n.read && <span className="unread-dot"></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenterPage;
