import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import AppHeader from '../components/AppHeader';
import { CREAM_BG } from '../theme';

// The 5-stage pipeline from the requirements doc (UR3), in order.
// "Rejected" isn't part of this linear pipeline — it can happen from any
// stage, so it gets its own badge instead of a position on the tracker.
const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Hired'];

function StatusTracker({ status }) {
  const currentIndex = STAGES.indexOf(status);

  return (
    <div style={styles.tracker}>
      {STAGES.map((stage, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={stage} style={styles.trackerStep}>
            <div
              style={{
                ...styles.trackerDot,
                ...(isDone ? styles.trackerDotDone : {}),
                ...(isCurrent ? styles.trackerDotCurrent : {}),
              }}
            />
            <span
              style={{
                ...styles.trackerLabel,
                ...(isCurrent ? styles.trackerLabelCurrent : {}),
              }}
            >
              {stage}
            </span>
            {i < STAGES.length - 1 && (
              <div
                style={{
                  ...styles.trackerLine,
                  ...(i < currentIndex ? styles.trackerLineDone : {}),
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Student Module — "no more guessing" progress view from the proposal.
function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/ApplicationControllerAPC1/my-applications')
      .then((response) => setApplications(response.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>My Applications</h2>

        {loading && <p style={styles.loadingText}>Loading...</p>}

        {!loading && applications.length === 0 && (
          <p style={styles.loadingText}>
            You haven't applied to anything yet — head back to Jobs to get started.
          </p>
        )}

        <div style={styles.list}>
          {applications.map((app) => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>{app.jobTitle}</h3>
                <span style={styles.appliedDate}>
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </span>
              </div>
              {app.status === 'Rejected' ? (
                <div style={styles.rejectedBadge}>
                  Not selected for this role
                </div>
              ) : (
                <StatusTracker status={app.status} />
              )}
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
    alignItems: 'baseline',
    marginBottom: '18px',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },

  appliedDate: {
    fontSize: '12px',
    color: '#94A3B8',
  },

  tracker: {
    display: 'flex',
    alignItems: 'flex-start',
  },

  trackerStep: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },

  trackerDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#E2E8F0',
    border: '2px solid #E2E8F0',
    zIndex: 1,
  },

  trackerDotDone: {
    background: '#2563EB',
    border: '2px solid #2563EB',
  },

  trackerDotCurrent: {
    background: '#FFFFFF',
    border: '2px solid #2563EB',
  },

  trackerLabel: {
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '6px',
    textAlign: 'center',
  },

  trackerLabelCurrent: {
    color: '#1E40AF',
    fontWeight: '700',
  },

  trackerLine: {
    position: 'absolute',
    top: '6px',
    left: '50%',
    width: '100%',
    height: '2px',
    background: '#E2E8F0',
  },

  trackerLineDone: {
    background: '#2563EB',
  },

  rejectedBadge: {
    display: 'inline-block',
    background: '#FEF2F2',
    color: '#B91C1C',
    border: '1px solid #FECACA',
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '700',
  },
};

export default MyApplicationsPage;
