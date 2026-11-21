import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AppHeader from '../components/AppHeader';
import { CREAM_BG } from '../theme';

// Matches the ApplicationStatus enum on the backend exactly — UpdateStatusAsync
// rejects anything else, so these are the only options offered here.
const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Hired', 'Rejected'];

// Applicants at or above this match score get a "Top Match" callout with a
// one-click shortcut to move them straight into the next step.
const TOP_MATCH_THRESHOLD = 90;

// Recruiter Module — "AI Candidate Ranking" + "One-Click Status Updates".
// Applicants are already sorted by match % server-side (best candidate first).
function RecruiterApplicantsPage() {
  const { jobPostingId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [messagingId, setMessagingId] = useState(null);
  const [sentMessageId, setSentMessageId] = useState(null);

  const loadApplicants = () => {
    setLoading(true);
    setError('');
    axiosClient
      .get(`/ApplicationControllerAPC1/posting/${jobPostingId}/details`)
      .then((response) => setApplicants(response.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load applicants'))
      .finally(() => setLoading(false));
  };

  useEffect(loadApplicants, [jobPostingId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await axiosClient.put(`/ApplicationControllerAPC1/${applicationId}/status`, {
        status: newStatus,
      });
      setApplicants((prev) =>
        prev.map((a) =>
          a.applicationId === applicationId ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Direct communication (UR3) — sends a custom message to the applicant as
  // an in-app Notification. Email uses a plain mailto: link instead, since
  // that needs no backend support and opens the recruiter's own mail client.
  const handleSendMessage = async (applicant) => {
    const text = window.prompt(`Message to ${applicant.studentName}:`);
    if (!text || !text.trim()) return;

    setMessagingId(applicant.applicationId);
    try {
      await axiosClient.post(`/ApplicationControllerAPC1/${applicant.applicationId}/message`, {
        message: text.trim(),
      });
      setSentMessageId(applicant.applicationId);
      setTimeout(() => setSentMessageId(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send message');
    } finally {
      setMessagingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.content}>
        <Link to="/recruiter/dashboard" style={styles.backLink}>
          ← Back to My Postings
        </Link>

        <h2 style={styles.sectionTitle}>Applicants</h2>
        <p style={styles.helperText}>
          Sorted by AI match score — highest match first.
        </p>

        {loading && <p style={styles.loadingText}>Loading...</p>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && applicants.length === 0 && (
          <p style={styles.loadingText}>No one has applied to this posting yet.</p>
        )}

        <div style={styles.list}>
          {applicants.map((a) => (
            <div key={a.applicationId} style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <div>
                  <h3 style={styles.cardTitle}>{a.studentName}</h3>
                  <p style={styles.cardEmail}>{a.studentEmail}</p>
                </div>
                <div
                  style={{
                    ...styles.matchBadge,
                    ...(a.matchPercentage >= TOP_MATCH_THRESHOLD ? styles.matchBadgeTop : {}),
                  }}
                >
                  {a.matchPercentage >= TOP_MATCH_THRESHOLD ? '⭐ ' : ''}
                  {a.matchPercentage}% match
                </div>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaItem}>GPA: {a.gpa}</span>
                {a.resumeFileUrl && (
                  <a href={a.resumeFileUrl} target="_blank" rel="noreferrer" style={styles.resumeLink}>
                    View Resume
                  </a>
                )}
              </div>

              {a.techStack && (
                <div style={styles.skillsRow}>
                  {a.techStack.split(',').map((skill, i) => (
                    <span key={i} style={styles.skillTag}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}

              {a.matchPercentage >= TOP_MATCH_THRESHOLD && a.status === 'Applied' && (
                <div style={styles.topMatchCallout}>
                  <span>🌟 Top match — recommended to shortlist for an interview.</span>
                  <button
                    onClick={() => handleStatusChange(a.applicationId, 'Shortlisted')}
                    disabled={updatingId === a.applicationId}
                    style={styles.quickActionButton}
                  >
                    Shortlist now →
                  </button>
                </div>
              )}

              {/* Direct communication (UR3): email opens the recruiter's own mail
                  client, Message sends an in-app notification to the applicant. */}
              <div style={styles.contactRow}>
                <a href={`mailto:${a.studentEmail}`} style={styles.contactButton}>
                  ✉ Email
                </a>
                {a.studentPhone ? (
                  <a href={`tel:${a.studentPhone}`} style={styles.contactButton}>
                    📞 Call
                  </a>
                ) : (
                  <span style={styles.contactButtonDisabled} title="This student hasn't added a phone number">
                    📞 Call
                  </span>
                )}
                <button
                  onClick={() => handleSendMessage(a)}
                  disabled={messagingId === a.applicationId}
                  style={styles.contactButton}
                >
                  {messagingId === a.applicationId ? 'Sending...' : '💬 Message'}
                </button>
                {sentMessageId === a.applicationId && (
                  <span style={styles.sentConfirm}>✓ Sent</span>
                )}
              </div>

              <div style={styles.statusRow}>
                <label style={styles.statusLabel}>Status:</label>
                <select
                  value={a.status}
                  disabled={updatingId === a.applicationId}
                  onChange={(e) => handleStatusChange(a.applicationId, e.target.value)}
                  style={styles.statusSelect}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {updatingId === a.applicationId && (
                  <span style={styles.savingText}>Saving...</span>
                )}
                <span style={styles.appliedDate}>
                  Applied {new Date(a.appliedAt).toLocaleDateString()}
                </span>
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
    maxWidth: '760px',
    margin: '0 auto',
    padding: '40px 24px',
  },

  backLink: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#2563EB',
    fontWeight: '600',
    textDecoration: 'none',
    marginBottom: '16px',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 4px',
  },

  helperText: {
    fontSize: '13px',
    color: '#64748B',
    margin: '0 0 20px',
  },

  loadingText: {
    color: '#64748B',
    fontSize: '14px',
  },

  error: {
    background: '#FEF2F2',
    color: '#DC2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px 24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
  },

  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 2px',
  },

  cardEmail: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
  },

  matchBadge: {
    background: '#F0FDF4',
    color: '#15803D',
    border: '1px solid #BBF7D0',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },

  matchBadgeTop: {
    background: '#FFFBEB',
    color: '#B45309',
    border: '1px solid #FDE68A',
  },

  topMatchCallout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#92400E',
  },

  quickActionButton: {
    background: '#B45309',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },

  contactButton: {
    background: '#F1F5F9',
    color: '#334155',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  },

  contactButtonDisabled: {
    background: '#F8FAFC',
    color: '#CBD5E1',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'not-allowed',
  },

  sentConfirm: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#15803D',
  },

  savingText: {
    fontSize: '11px',
    color: '#64748B',
    fontStyle: 'italic',
  },

  metaRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '10px',
  },

  metaItem: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '600',
  },

  resumeLink: {
    fontSize: '12px',
    color: '#2563EB',
    fontWeight: '600',
    textDecoration: 'none',
  },

  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '14px',
  },

  skillTag: {
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
  },

  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
  },

  statusLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },

  statusSelect: {
    padding: '6px 10px',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0F172A',
    background: '#FFFFFF',
  },

  appliedDate: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#94A3B8',
  },
};

export default RecruiterApplicantsPage;
