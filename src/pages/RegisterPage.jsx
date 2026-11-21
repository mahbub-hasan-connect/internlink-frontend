import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../auth/AuthContext';
import { getUserFromToken } from '../auth/jwt';

// Student and recruiter users can select their role from the dropdown
function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('0'); // Default: Student (enum 0)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/AuthControllerAC1/register', {
        name,
        email,
        password,
        role: parseInt(role),
      });

      login(response.data.token);

      // New Students go to their dashboard; Recruiters go to theirs.
      const decoded = getUserFromToken(response.data.token);
      if (decoded?.role === 'Student') navigate('/dashboard');
      else if (decoded?.role === 'Recruiter') navigate('/recruiter/dashboard');
      else navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.blobOrange} />
      <div style={styles.blobGreen} />

      <div style={styles.card}>
        <h1 style={styles.title}>
          <span style={styles.titleDark}>Intern</span>
          <span style={styles.titleAccent}>Link</span>
        </h1>
        <p style={styles.subtitle}>Create your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />

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

          <label style={styles.label}>I am a...</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="0">Student</option>
            <option value="1">Recruiter</option>
            <option value="2">Admin</option>
          </select>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Register →'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// Same warm, editorial palette as LoginPage — cream / forest green / amber.
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

export default RegisterPage;
