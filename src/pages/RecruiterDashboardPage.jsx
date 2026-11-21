import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AppHeader from '../components/AppHeader';
import { GREEN, GREEN_DARK, OLIVE, AMBER_DARK, CREAM_BG, BORDER, CARD_SHADOW, TEXT_MUTED, TEXT_BODY, DANGER, DANGER_BG, DANGER_BORDER } from '../theme';

const emptyForm = {
  title: '',
  description: '',
  requiredSkills: '',
  location: '',
  stipend: '',
};

// The same status pipeline MyApplicationsPage tracks, plus Rejected — used
// here to build the "Status Breakdown" card from real applicant data.
const STATUS_ORDER = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Hired', 'Rejected'];
const STATUS_COLOR = {
  Applied: TEXT_MUTED,
  Shortlisted: '#2563EB',
  Interview: AMBER_DARK,
  Offered: OLIVE,
  Hired: GREEN,
  Rejected: DANGER,
};

// Recruiter Module — "Job Listing Controls": create/edit/delete your own
// postings, jump into each one's applicant list, and (new) see real
// at-a-glance stats pulled from your own postings' applicants instead of
// just a bare list. Restyled to the same cream/green/amber identity as the
// rest of the app instead of the old blue theme.
function RecruiterDashboardPage() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating a new posting
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // { [postingId]: ApplicationDetailResponse[] } — fed into the stat cards,
  // status breakdown, and job performance list below. Fetched per-posting
  // since there's no single "all my applicants" endpoint.
  const [applicantsByPosting, setApplicantsByPosting] = useState({});

  const loadPostings = () => {
    setLoading(true);
    axiosClient
      .get('/JobPostingControllerJPC1/my-postings')
      .then((response) => setPostings(response.data))
      .finally(() => setLoading(false));
  };

  useEffect(loadPostings, []);

  useEffect(() => {
    if (postings.length === 0) return;
    postings.forEach((posting) => {
      axiosClient
        .get(`/ApplicationControllerAPC1/posting/${posting.id}/details`)
        .then((response) => {
          setApplicantsByPosting((prev) => ({ ...prev, [posting.id]: response.data }));
        })
        .catch(() => {
          setApplicantsByPosting((prev) => ({ ...prev, [posting.id]: [] }));
        });
    });
  }, [postings]);

  // Real numbers, all derived from the applicant lists fetched above — no
  // placeholder stats like "Profile Views", since that isn't something this
  // backend tracks.
  const stats = useMemo(() => {
    const all = Object.values(applicantsByPosting).flat();
    const statusCounts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    all.forEach((a) => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status] += 1;
    });
    const perPosting = postings.map((p) => {
      const apps = applicantsByPosting[p.id] || [];
      const avgMatch = apps.length
        ? Math.round(apps.reduce((sum, a) => sum + (a.matchPercentage || 0), 0) / apps.length)
        : null;
      return { id: p.id, title: p.title, count: apps.length, avgMatch };
    });
    return {
      activeListings: postings.length,
      totalApplicants: all.length,
      avgAppsPerJob: postings.length ? (all.length / postings.length).toFixed(1) : '0',
      hired: statusCounts.Hired,
      statusCounts,
      perPosting,
    };
  }, [postings, applicantsByPosting]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (posting) => {
    setEditingId(posting.id);
    setForm({
      title: posting.title,
      description: posting.description,
      requiredSkills: posting.requiredSkills,
      location: posting.location,
      stipend: posting.stipend ?? '',
    });
    setError('');
    setShowForm(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      requiredSkills: form.requiredSkills,
      location: form.location,
      stipend: form.stipend === '' ? null : parseFloat(form.stipend),
    };

    try {
      if (editingId) {
        await axiosClient.put(`/JobPostingControllerJPC1/${editingId}`, payload);
      } else {
        await axiosClient.post('/JobPostingControllerJPC1', payload);
      }
      setShowForm(false);
      loadPostings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this posting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await axiosClient.delete(`/JobPostingControllerJPC1/${id}`);
      loadPostings();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this posting');
    }
  };

  const handleExportCsv = async (id, title) => {
    try {
      const response = await axiosClient.get(`/JobPostingControllerJPC1/${id}/export-csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicants_${title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Could not export applicants CSV');
    }
  };

  const maxStatusCount = Math.max(1, ...Object.values(stats.statusCounts));

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Recruiter Dashboard</h1>
        <p style={styles.pageSubtitle}>Manage your job listings and applicants</p>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.activeListings}</p>
            <p style={styles.statLabel}>Active Listings</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.totalApplicants}</p>
            <p style={styles.statLabel}>Total Applicants</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.avgAppsPerJob}</p>
            <p style={styles.statLabel}>Avg Apps/Job</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{stats.hired}</p>
            <p style={styles.statLabel}>Hired</p>
          </div>
        </div>

        <div style={styles.insightsRow}>
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>Status Breakdown</h3>
            {stats.totalApplicants === 0 ? (
              <p style={styles.loadingText}>No applications received yet.</p>
            ) : (
              <div style={styles.statusList}>
                {STATUS_ORDER.map((s) => (
                  <div key={s} style={styles.statusRow}>
                    <span style={styles.statusRowLabel}>{s}</span>
                    <div style={styles.statusBarTrack}>
                      <div
                        style={{
                          ...styles.statusBarFill,
                          width: `${(stats.statusCounts[s] / maxStatusCount) * 100}%`,
                          background: STATUS_COLOR[s],
                        }}
                      />
                    </div>
                    <span style={styles.statusRowCount}>{stats.statusCounts[s]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>Job Performance</h3>
            {stats.perPosting.length === 0 ? (
              <p style={styles.loadingText}>No jobs posted yet.</p>
            ) : (
              <div style={styles.perfList}>
                {stats.perPosting.map((p) => (
                  <div key={p.id} style={styles.perfRow}>
                    <span style={styles.perfTitle}>{p.title}</span>
                    <span style={styles.perfMeta}>
                      {p.count} applicant{p.count === 1 ? '' : 's'}
                      {p.avgMatch !== null ? ` · avg match ${p.avgMatch}%` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.headerRow}>
          <h2 style={styles.sectionTitle}>My Job Postings</h2>
          <button onClick={openCreateForm} style={styles.primaryButton}>
            + Post New Job
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>{editingId ? 'Edit Posting' : 'New Job Posting'}</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                style={styles.input}
                required
              />

              <label style={styles.label}>Description</label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                style={{ ...styles.input, ...styles.textarea }}
                required
              />

              <label style={styles.label}>Required Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, C#, SQL"
                value={form.requiredSkills}
                onChange={handleChange('requiredSkills')}
                style={styles.input}
                required
              />

              <label style={styles.label}>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={handleChange('location')}
                style={styles.input}
                required
              />

              <label style={styles.label}>Stipend (optional, ৳)</label>
              <input
                type="number"
                value={form.stipend}
                onChange={handleChange('stipend')}
                style={styles.input}
              />

              <div style={styles.formButtonRow}>
                <button type="submit" style={styles.primaryButton} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Post Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <p style={styles.loadingText}>Loading...</p>}

        {!loading && postings.length === 0 && (
          <p style={styles.loadingText}>
            You haven't posted any internships yet — click "Post New Job" to get started.
          </p>
        )}

        <div style={styles.list}>
          {postings.map((posting) => (
            <div key={posting.id} style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <div>
                  <h3 style={styles.cardTitle}>{posting.title}</h3>
                  <p style={styles.cardLocation}>📍 {posting.location}</p>
                </div>
                {posting.stipend && <p style={styles.stipend}>৳{posting.stipend}</p>}
              </div>

              <p style={styles.cardDescription}>{posting.description}</p>

              <div style={styles.skillsRow}>
                {posting.requiredSkills.split(',').map((skill, i) => (
                  <span key={i} style={styles.skillTag}>
                    {skill.trim()}
                  </span>
                ))}
              </div>

              <div style={styles.actionsRow}>
                <Link
                  to={`/recruiter/postings/${posting.id}/applicants`}
                  style={styles.viewApplicantsLink}
                >
                  View Applicants
                </Link>
                <button onClick={() => openEditForm(posting)} style={styles.secondaryButton}>
                  Edit
                </button>
                <button
                  onClick={() => handleExportCsv(posting.id, posting.title)}
                  style={styles.secondaryButton}
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleDelete(posting.id)}
                  style={styles.dangerButton}
                >
                  Delete
                </button>
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px 24px 80px',
  },

  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: GREEN_DARK,
    margin: '0 0 4px',
  },

  pageSubtitle: {
    fontSize: '15px',
    color: TEXT_MUTED,
    margin: '0 0 28px',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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

  insightsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '36px',
  },

  insightCard: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '22px',
    boxShadow: CARD_SHADOW,
  },

  insightTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 16px',
  },

  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  statusRow: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 24px',
    alignItems: 'center',
    gap: '10px',
  },

  statusRowLabel: {
    fontSize: '12px',
    color: TEXT_BODY,
    fontWeight: '600',
  },

  statusBarTrack: {
    height: '8px',
    background: '#F0EDE4',
    borderRadius: '999px',
    overflow: 'hidden',
  },

  statusBarFill: {
    height: '100%',
    borderRadius: '999px',
  },

  statusRowCount: {
    fontSize: '12px',
    fontWeight: '700',
    color: GREEN_DARK,
    textAlign: 'right',
  },

  perfList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  perfRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  perfTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: GREEN_DARK,
  },

  perfMeta: {
    fontSize: '12px',
    color: TEXT_MUTED,
  },

  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: 0,
  },

  loadingText: {
    color: TEXT_MUTED,
    fontSize: '14px',
  },

  formCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${BORDER}`,
    boxShadow: CARD_SHADOW,
    marginBottom: '24px',
  },

  formTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 16px',
  },

  formButtonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: TEXT_BODY,
    marginBottom: '6px',
    marginTop: '14px',
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'system-ui, sans-serif',
    background: '#FFFFFF',
    color: GREEN_DARK,
  },

  textarea: {
    minHeight: '80px',
    resize: 'vertical',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px 24px',
    border: `1px solid ${BORDER}`,
    boxShadow: CARD_SHADOW,
  },

  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 4px',
  },

  cardLocation: {
    fontSize: '13px',
    color: TEXT_MUTED,
    margin: 0,
  },

  cardDescription: {
    fontSize: '13px',
    color: TEXT_BODY,
    margin: '12px 0',
    lineHeight: '1.5',
  },

  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
  },

  skillTag: {
    background: '#F8F6F1',
    color: GREEN_DARK,
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
    border: `1px solid ${BORDER}`,
  },

  stipend: {
    fontSize: '14px',
    fontWeight: '700',
    color: OLIVE,
    margin: 0,
  },

  actionsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  viewApplicantsLink: {
    background: GREEN,
    color: '#FFFFFF',
    padding: '8px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
  },

  primaryButton: {
    background: GREEN,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '999px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  secondaryButton: {
    background: '#F8F6F1',
    color: GREEN_DARK,
    border: `1px solid ${BORDER}`,
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  dangerButton: {
    background: DANGER_BG,
    color: DANGER,
    border: `1px solid ${DANGER_BORDER}`,
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  error: {
    background: DANGER_BG,
    color: DANGER,
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
};

export default RecruiterDashboardPage;
