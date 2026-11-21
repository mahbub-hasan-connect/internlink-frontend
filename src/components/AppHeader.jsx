import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../auth/AuthContext';
import { GREEN, AMBER, DANGER } from '../theme';

// One shared header for every page — keeps nav links, the notification bell,
// and the logout button consistent instead of copy-pasted into each page.
// Restyled to match the public Home page's dark-green/amber identity, so the
// whole app (Jobs, Student/Recruiter/Admin dashboards) reads as one brand
// instead of switching to a different blue theme once you log in.
function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Prefer the real name from the JWT (added once AuthServiceAS1 started
  // signing a Name claim); older still-valid tokens won't have it, so fall
  // back to the part of the email before the @ the same way the Student
  // Dashboard's welcome banner does.
  const displayName = user?.name || user?.email?.split('@')[0] || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  // Used to style whichever nav link matches the current page, so — e.g. — the
  // Jobs link is clearly highlighted when Jobs is the first screen after login.
  const isActive = (path) => location.pathname === path;
  const navLinkStyle = (path) => ({
    ...styles.navLink,
    ...(isActive(path) ? styles.navLinkActive : {}),
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    axiosClient
      .get('/NotificationControllerNTC1')
      .then((response) => {
        setUnreadCount(response.data.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <Link to={isAuthenticated && user.role === 'Student' ? '/dashboard' : '/jobs'} style={styles.brand}>
        <span style={styles.brandLight}>Intern</span>
        <span style={styles.brandAccent}>Link</span>
      </Link>

      <nav style={styles.nav}>
        {isAuthenticated ? (
          <>
            {user.role === 'Student' && (
              <>
                <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/jobs" style={navLinkStyle('/jobs')}>
                  Jobs
                </Link>
                <Link to="/profile" style={navLinkStyle('/profile')}>
                  My Profile
                </Link>
                <Link to="/my-applications" style={navLinkStyle('/my-applications')}>
                  My Applications
                </Link>
              </>
            )}

            {user.role === 'Recruiter' && (
              <>
                <Link to="/jobs" style={navLinkStyle('/jobs')}>
                  Jobs
                </Link>
                <Link to="/recruiter/dashboard" style={navLinkStyle('/recruiter/dashboard')}>
                  Dashboard
                </Link>
              </>
            )}

            {user.role === 'Admin' && (
              <>
                <Link to="/jobs" style={navLinkStyle('/jobs')}>
                  Jobs
                </Link>
                <Link to="/admin" style={navLinkStyle('/admin')}>
                  Admin Panel
                </Link>
              </>
            )}

            <div style={styles.userBadge} title={user?.email || ''}>
              <span style={styles.userAvatar}>{initial}</span>
              <span style={styles.userBadgeText}>
                <span style={styles.userName}>{displayName}</span>
                <span style={styles.userRole}>{user.role}</span>
              </span>
            </div>

            <Link to="/notifications" style={styles.bellLink}>
              🔔
              {unreadCount > 0 && <span style={styles.bellBadge}>{unreadCount}</span>}
            </Link>

            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={navLinkStyle('/login')}>
              Login
            </Link>
            <Link to="/register" style={navLinkStyle('/register')}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    background: GREEN,
    boxShadow: '0 2px 16px rgba(22, 36, 29, 0.18)',
    padding: '24px 56px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'system-ui, sans-serif',
    // Sticky so it stays visible while scrolling on every page that uses this
    // header (Jobs, Student/Recruiter/Admin dashboards, Profile, Applications,
    // Notifications) — same idea as the public Home page's nav bar, but
    // "sticky" (unlike "fixed") keeps its place in the page's normal layout
    // flow, so no per-page top-padding fix-ups are needed to stop it from
    // covering the content underneath.
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },

  brand: {
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
    textDecoration: 'none',
  },

  brandLight: { color: '#FFFFFF' },
  brandAccent: { color: AMBER },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  navLink: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '11px 18px',
    borderRadius: '999px',
  },

  // Highlights whichever nav link matches the current page (e.g. Jobs, right
  // after login) so it's obvious where you are in the app.
  navLinkActive: {
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.16)',
  },

  // Shows who's logged in and as which role — otherwise a Student, Recruiter
  // and Admin dashboard look identical at a glance once you're past the URL.
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '999px',
    padding: '6px 16px 6px 6px',
    marginRight: '2px',
  },

  userAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: AMBER,
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  userBadgeText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.25',
  },

  userName: {
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  userRole: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },

  bellLink: {
    position: 'relative',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '0 6px',
  },

  bellBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    background: DANGER,
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '999px',
    padding: '1px 5px',
    minWidth: '14px',
    textAlign: 'center',
  },

  logoutButton: {
    background: AMBER,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '999px',
    padding: '11px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '4px',
  },
};

export default AppHeader;
