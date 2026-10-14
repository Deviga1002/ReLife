import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getNotifications()
      .then((res) => {
        setNotifications(res.data.data);
        setUnread(res.data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    toast.success('All marked as read');
    load();
  };

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>Notifications</h1>
          <p>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAll}>Mark all read</button>
        )}
      </div>
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state"><p>No notifications yet.</p></div>
      ) : (
        <div className="card">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: n.isRead ? 'transparent' : '#f0fdf4',
                cursor: n.isRead ? 'default' : 'pointer',
              }}
            >
              <div className="flex-between">
                <strong>{n.title}</strong>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
