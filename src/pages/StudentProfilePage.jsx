import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import AppHeader from '../components/AppHeader';
import { CREAM_BG } from '../theme';

// Student Module — create the profile the first time, then edit it after.
// GET /api/StudentProfileControllerSPC1 returns 404 until a profile exists,
// so we use that to decide whether to POST (create) or PUT (update).
function StudentProfilePage() {
  const [hasProfile, setHasProfile] = useState(false);
  const [gpa, setGpa] = useState('');
  const [techStack, setTechStack] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [resumeFileUrl, setResumeFileUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    axiosClient
      .get('/StudentProfileControllerSPC1')
      .then((response) => {
        const profile = response.data;
        setHasProfile(true);
        setGpa(String(profile.gpa));
        setTechStack(profile.techStack || '');
        setPortfolioLink(profile.portfolioLink || '');
        setResumeFileUrl(profile.resumeFileUrl || '');
        setPhone(profile.phone || '');
      })
      .catch(() => {
        // 404 just means "no profile yet" — that's fine, the form starts empty
        setHasProfile(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavedMessage('');
    setSaving(true);

    const payload = {
      gpa: parseFloat(gpa),
      techStack,
      portfolioLink: portfolioLink || null,
      resumeFileUrl: resumeFileUrl || null,
      phone: phone || null,
    };

    try {
      if (hasProfile) {
        await axiosClient.put('/StudentProfileControllerSPC1', payload);
      } else {
        await axiosClient.post('/StudentProfileControllerSPC1', payload);
        setHasProfile(true);
      }
      setSavedMessage('Profile saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <AppHeader />

      {loading ? (
        <p style={styles.loadingText}>Loading...</p>
      ) : (
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              {hasProfile ? 'Edit My Profile' : 'Create My Profile'}
            </h2>
            <p style={styles.helperText}>
              Your GPA and tech stack are what the AI Skill-Match Engine compares
              against each job posting's required skills.
            </p>

            {error && <div style={styles.error}>{error}</div>}
            {savedMessage && <div style={styles.success}>{savedMessage}</div>}

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>GPA (0.0 – 4.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g. 3.65"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                style={styles.input}
                required
              />

              <label style={styles.label}>Tech Stack / Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, C#, SQL, Node.js"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                style={styles.input}
                required
              />

              <label style={styles.label}>Portfolio Link (optional)</label>
              <input
                type="url"
                placeholder="https://your-portfolio.com"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>Resume Link (optional)</label>
              <input
                type="url"
                placeholder="Link to your uploaded PDF resume"
                value={resumeFileUrl}
                onChange={(e) => setResumeFileUrl(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>Phone Number (optional)</label>
              <input
                type="tel"
                placeholder="e.g. +8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
              <p style={styles.fieldHint}>
                Shown to recruiters on your applications so they can call you directly.
              </p>

              <button type="submit" style={styles.button} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
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
    maxWidth: '560px',
    margin: '0 auto',
    padding: '40px 24px',
  },

  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '28px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 6px',
  },

  helperText: {
    fontSize: '13px',
    color: '#64748B',
    margin: '0 0 20px',
    lineHeight: '1.5',
  },

  fieldHint: {
    fontSize: '11px',
    color: '#94A3B8',
    margin: '4px 0 0',
  },

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
    marginTop: '14px',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#FFFFFF',
    color: '#0F172A',
  },

  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '24px',
  },

  error: {
    background: '#FEF2F2',
    color: '#DC2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },

  success: {
    background: '#F0FDF4',
    color: '#166534',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },

  loadingText: {
    color: '#64748B',
    fontSize: '14px',
    padding: '40px',
  },
};

export default StudentProfilePage;
