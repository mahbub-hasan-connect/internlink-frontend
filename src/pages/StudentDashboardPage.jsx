import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../auth/AuthContext';
import AppHeader from '../components/AppHeader';
import { GREEN, GREEN_DARK, OLIVE, AMBER_DARK, CREAM_BG, BORDER, CARD_SHADOW, TEXT_MUTED, TEXT_BODY } from '../theme';

const STATUS_COLOR = {
  Applied: TEXT_MUTED,
  Shortlisted: '#2563EB',
  Interview: AMBER_DARK,
  Offered: OLIVE,
  Hired: GREEN,
  Rejected: '#DC2626',
};

// Student landing page — a real-data overview instead of dropping students
// straight onto the Jobs grid. Modeled on the reference site's student
// sidebar (Dashboard / Search Jobs / Applications / My Profile / Resume
// Match / Skill Gap / For You / Notifications), minus Video Interview, AI
// Interview and Social Feed — those features don't exist in this app, so
// rather than link to empty pages, "Resume Match"/"Skill Gap"/"For You" are
// folded into the "Recommended For You" card below using the real AI match
// score this app already computes, and the rest map onto pages that
// actually exist (Jobs, My Applications, My Profile, Notifications).
function StudentDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/ApplicationControllerAPC1/my-applications')
      .then((response) => setApplications(response.data))
      .finally(() => setLoadingApplications(false));

    axiosClient
      .get('/NotificationControllerNTC1')
      .then((response) => {
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      })
      .finally(() => setLoadingNotifications(false));
  }, []);

  // "Recommended For You" — every posting's real AI match score, sorted,
  // top 3. Same match endpoint the Jobs page already uses per-card.
  useEffect(() => {
    if (!user?.userId) return;
    axiosClient
      .get('/JobPostingControllerJPC1')
      .then(async (response) => {
        const postings = response.data;
        const withMatch = await Promise.all(
          postings.map((posting) =>
            axiosClient
              .get(`/MatchControllerMTC1/${user.userId}/${posting.id}`)
              .then((res) => ({ ...posting, matchPercentage: res.data.matchPercentage }))
              .catch(() => ({ ...posting, matchPercentage: null }))
          )
        );
        const ranked = withMatch
          .filter((p) => p.matchPercentage !== null)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 3);
        setRecommended(ranked);
      })
      .finally(() => setLoadingRecommended(false));
  }, [user?.userId]);

  const stats = useMemo(() => {
    const count = (status) => applications.filter((a) => a.status === status).length;
    return {
      total: applications.length,
      shortlisted: count('Shortlisted'),
      interviews: count('Interview'),
      hired: count('Hired'),
    };
  }, [applications]);

  const recentApplications = applications.slice(0, 3);
  const recentNotifications = notifications.slice(0, 3);
  const firstName = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.content}>
        <div style={styles.welcomeBanner}>
          <div>
            <h1 style={styles.welcomeTitle}>Welcome back, {firstName}! 👋</h1>
            <p style={styles.welcomeText}>Here's what's happening with your internship search today.</p>
          </div>
          <Link to="/jobs" style={styles.welcomeButton}>
            Explore Jobs →
          </Link>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.total}</p>
            <p style={styles.statLabel}>Applications</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.shortlisted}</p>
            <p style={styles.statLabel}>Shortlisted</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.interviews}</p>
            <p style={styles.statLabel}>Interviews</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.hired}</p>
            <p style={styles.statLabel}>Hired</p>
          </div>
        </div>

        <div style={styles.twoColRow}>
          <div style={styles.panelCard}>
            <div style={styles.panelHeaderRow}>
              <h3 style={styles.panelTitle}>Recent Applications</h3>
              <Link to="/my-applications" style={styles.panelLink}>
                View All
              </Link>
            </div>
            {loadingApplications && <p style={styles.loadingText}>Loading...</p>}
            {!loadingApplications && recentApplications.length === 0 && (
              <p style={styles.loadingText}>No applications yet. Start applying!</p>
            )}
            {recentApplications.map((app) => (
              <div key={app.id} style={styles.panelRow}>
                <span style={styles.panelRowTitle}>{app.jobTitle}</span>
                <span
                  style={{
                    ...styles.statusPill,
                    color: STATUS_COLOR[app.status] || TEXT_MUTED,
                    borderColor: STATUS_COLOR[app.status] || BORDER,
                  }}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.panelCard}>
            <div style={styles.panelHeaderRow}>
              <h3 style={styles.panelTitle}>Recommended For You</h3>
              <Link to="/jobs" style={styles.panelLink}>
                See All
              </Link>
            </div>
            {loadingRecommended && <p style={styles.loadingText}>Loading...</p>}
            {!loadingRecommended && recommended.length === 0 && (
              <p style={styles.loadingText}>Complete your profile to get match-based recommendations.</p>
            )}
            {recommended.map((posting) => (
              <Link key={posting.id} to="/jobs" style={styles.panelRow}>
                <span style={styles.panelRowTitle}>{posting.title}</span>
                <span style={styles.matchBadge}>{posting.matchPercentage}% match</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={styles.panelCard}>
          <div style={styles.panelHeaderRow}>
            <h3 style={styles.panelTitle}>Recent Notifications</h3>
            <Link to="/notifications" style={styles.panelLink}>
              View All
            </Link>
          </div>
          {loadingNotifications && <p style={styles.loadingText}>Loading...</p>}
          {!loadingNotifications && recentNotifications.length === 0 && (
            <p style={styles.loadingText}>No notifications yet.</p>
          )}
          {recentNotifications.map((n) => (
            <div key={n.id} style={styles.notificationRow}>
              {!n.isRead && <span style={styles.unreadDot} />}
              <span style={styles.notificationText}>{n.message}</span>
            </div>
          ))}
        </div>

        <div style={styles.quickLinksRow}>
          <Link to="/jobs" style={styles.quickLink}>
            <span style={styles.quickLinkIcon}>🔍</span>
            Search Jobs
          </Link>
          <Link to="/my-applications" style={styles.quickLink}>
            <span style={styles.quickLinkIcon}>📄</span>
            Applications
          </Link>
          <Link to="/profile" style={styles.quickLink}>
            <span style={styles.quickLinkIcon}>👤</span>
            My Profile
          </Link>
          <Link to="/notifications" style={styles.quickLink}>
            <span style={styles.quickLinkIcon}>🔔</span>
            Notifications
          </Link>
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
    maxWidth: '980px',
    margin: '0 auto',
    padding: '48px 24px 80px',
  },

  welcomeBanner: {
    background: `linear-gradient(135deg, ${GREEN} 0%, ${OLIVE} 100%)`,
    borderRadius: '20px',
    padding: '28px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },

  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 6px',
  },

  welcomeText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.85)',
    margin: 0,
  },

  welcomeButton: {
    background: '#FFFFFF',
    color: GREEN_DARK,
    padding: '12px 22px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },

  statCard: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: CARD_SHADOW,
  },

  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: OLIVE,
    margin: '0 0 4px',
  },

  statLabel: {
    fontSize: '13px',
    color: TEXT_MUTED,
    fontWeight: '600',
    margin: 0,
  },

  twoColRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },

  panelCard: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '22px',
    boxShadow: CARD_SHADOW,
    marginBottom: '16px',
  },

  panelHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },

  panelTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: 0,
  },

  panelLink: {
    fontSize: '12px',
    fontWeight: '700',
    color: OLIVE,
    textDecoration: 'none',
  },

  loadingText: {
    color: TEXT_MUTED,
    fontSize: '13px',
    margin: 0,
  },

  panelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #F1EEE6',
    textDecoration: 'none',
  },

  panelRowTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: TEXT_BODY,
  },

  statusPill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '999px',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },

  matchBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: OLIVE,
    background: 'rgba(63,107,74,0.1)',
    padding: '3px 10px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
  },

  notificationRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 0',
    borderBottom: '1px solid #F1EEE6',
  },

  unreadDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: AMBER_DARK,
    marginTop: '5px',
    flexShrink: 0,
  },

  notificationText: {
    fontSize: '13px',
    color: TEXT_BODY,
    lineHeight: '1.5',
  },

  quickLinksRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '14px',
    marginTop: '8px',
  },

  quickLink: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '700',
    color: GREEN_DARK,
    textDecoration: 'none',
    boxShadow: CARD_SHADOW,
  },

  quickLinkIcon: {
    fontSize: '22px',
  },
};

export default StudentDashboardPage;
