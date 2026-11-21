import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../auth/AuthContext';
import { getUserFromToken } from '../auth/jwt';

// Student, recruiter, and admin users will use the same login page
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/AuthControllerAC1/login', {
        email,
        password,
      });

      // login() saves the token AND decodes it into { userId, email, role }
      // so the rest of the app immediately knows who is logged in.
      login(response.data.token);

      // Send each role to its own home: Students now have a real dashboard
      // (stats, recent applications, recommendations) instead of landing
      // straight on the Jobs grid; Recruiters/Admins land on their own
      // dashboards too. Decoded directly from the fresh token rather than
      // waiting on next render's auth state.
      const decoded = getUserFromToken(response.data.token);
      if (decoded?.role === 'Student') navigate('/dashboard');
      else if (decoded?.role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (decoded?.role === 'Admin') navigate('/admin');
      else navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Soft warm blobs behind the card — echoes the illustration accent
          colors from the InternLink brand reference instead of the old flat blue gradient */}
      <div style={styles.blobOrange} />
      <div style={styles.blobGreen} />

      <div style={styles.card}>
        <h1 style={styles.title}>
          <span style={styles.titleDark}>Intern</span>
          <span style={styles.titleAccent}>Link</span>
        </h1>
        <p style={styles.subtitle}>Welcome back — log in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

// Warm, editorial palette (cream / forest green / amber) matching the
// InternLink brand reference, in place of the old flat blue gradient.
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #F8F6F1 0%, #F0EDE4 100%)',
    fontFamily: 'system-ui, sans-serif',
    overflow: 'hidden',
  },

  // Radial-gradient glow, not a solid circle + blur() — large blur radii can
  // render as a solid black block on some browser/GPU combinations.
  blobOrange: {
    position: 'absolute',
    top: '-120px',
    right: '-100px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(232,112,58,0.30) 0%, rgba(232,112,58,0) 70%)',
    pointerEvents: 'none',
  },

  blobGreen: {
    position: 'absolute',
    bottom: '-140px',
    left: '-120px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(47,82,51,0.24) 0%, rgba(47,82,51,0) 70%)',
    pointerEvents: 'none',
  },

  card: {
    position: 'relative',
    zIndex: 1,
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px',
    width: '380px',
    boxShadow: '0 24px 60px rgba(27, 59, 47, 0.12)',
    border: '1px solid #EDE9DF',
  },

  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 4px',
    textAlign: 'center',
  },

  titleDark: {
    color: '#16241D',
  },

  titleAccent: {
    color: '#D97706',
  },

  subtitle: {
    fontSize: '14px',
    color: '#78716C',
    textAlign: 'center',
    margin: '0 0 28px',
  },

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#44403C',
    marginBottom: '6px',
    marginTop: '14px',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E7E2D9',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#FBFAF7',
    color: '#16241D',
  },

  button: {
    width: '100%',
    padding: '13px',
    background: '#1B3B2F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '22px',
  },

  error: {
    background: '#FEF2F2',
    color: '#B91C1C',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },

  footerText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#78716C',
    marginTop: '22px',
  },

  link: {
    color: '#B45309',
    fontWeight: '700',
    textDecoration: 'none',
  },
};

export default LoginPage;
