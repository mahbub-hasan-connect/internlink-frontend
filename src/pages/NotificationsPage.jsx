import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import AppHeader from '../components/AppHeader';
import { CREAM_BG } from '../theme';

// Notification System (Module 7) — in-app alerts, mainly fired when a
// Recruiter changes an application's status.
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/NotificationControllerNTC1')
      .then((response) => {
        // Newest first
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosClient.put(`/NotificationControllerNTC1/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Non-critical — just leave it unread if this fails
    }
  };

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Notifications</h2>

        {loading && <p style={styles.loadingText}>Loading...</p>}

        {!loading && notifications.length === 0 && (
          <p style={styles.loadingText}>No notifications yet.</p>
        )}

        <div style={styles.list}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ ...styles.card, ...(n.isRead ? {} : styles.cardUnread) }}
              onClick={() => !n.isRead && markAsRead(n.id)}
            >
              <p style={styles.message}>{n.message}</p>
              <div style={styles.metaRow}>
                <span style={styles.date}>{new Date(n.createdAt).toLocaleString()}</span>
                {!n.isRead && <span style={styles.unreadDot} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: CREAM_BG,
    fontFamily: 'system-ui, sans-serif',
  },

  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 24px',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '20px',
  },

  loadingText: {
    color: '#64748B',
    fontSize: '14px',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px 18px',
    cursor: 'pointer',
  },

  cardUnread: {
    borderColor: '#93C5FD',
    background: '#EFF6FF',
  },

  message: {
    fontSize: '13px',
    color: '#0F172A',
    margin: '0 0 8px',
    lineHeight: '1.5',
  },

  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  date: {
    fontSize: '11px',
    color: '#94A3B8',
  },

  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#2563EB',
  },
};

export default NotificationsPage;
