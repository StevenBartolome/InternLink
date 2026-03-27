import React, { useState } from 'react';
import { Bell, Send, Info, Megaphone } from 'lucide-react';
import { notificationsList, sentAnnouncements } from '../../data/adminMockData';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Toast from '../../components/coordinator/Toast';

const NotificationsCenterPage = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [notifications, setNotifications] = useState(notificationsList);
  const [announcements, setAnnouncements] = useState(sentAnnouncements);
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('All');

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    const newAnnouncement = {
      id: announcements.length + 1,
      title,
      target,
      dateSent: new Date().toISOString().split('T')[0],
      sentBy: 'Juan dela Cruz'
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle('');
    setMessage('');
    showToast(`Announcement "${newAnnouncement.title}" sent to ${target}.`, 'success');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px' },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
      gap: '24px',
    },
    card: { ...commonStyles.dashboardCard },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
    input: {
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      outline: 'none',
    },
    notificationItem: (read) => ({
      padding: '16px',
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: read ? 'transparent' : theme.colors.bgAccent,
      display: 'flex',
      gap: '12px',
    })
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Notification Center</h1>
      </header>

      <div style={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.card}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={20} color={theme.colors.primary} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Global Broadcast</h3>
            </div>
            <form onSubmit={handleSendAnnouncement} style={{ padding: '24px' }}>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Title</label>
                <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Target Audience</label>
                <select style={styles.input} value={target} onChange={e => setTarget(e.target.value)}>
                  {['All', 'Students', 'Employers', 'Coordinators', 'Supervisors'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Message Body</label>
                <textarea
                  style={{ ...styles.input, minHeight: '100px', resize: 'none' }}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, width: '100%' }}>
                <Send size={18} /> Send Announcement
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}` }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Announcement History</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', backgroundColor: theme.colors.bgSecondary }}>
                    <th style={{ padding: '12px 20px', fontSize: '0.85rem' }}>Title</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.85rem' }}>Target</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.85rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map(ann => (
                    <tr key={ann.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600 }}>{ann.title}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ ...commonStyles.dashboardBadge, backgroundColor: theme.colors.bgAccent, color: theme.colors.primary }}>{ann.target}</span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '0.8rem', color: theme.colors.textMuted }}>{ann.dateSent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>System Logistics</h3>
            <button
              style={{ background: 'none', border: 'none', color: theme.colors.primary, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </button>
          </div>
          <div>
            {notifications.map(n => (
              <div key={n.id} style={styles.notificationItem(n.read)}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: theme.colors.bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}>
                  <Info size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.textMain }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '4px' }}>{n.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenterPage;
