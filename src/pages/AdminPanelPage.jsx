import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import AppHeader from '../components/AppHeader';
import { GREEN_DARK, OLIVE, AMBER, AMBER_DARK, CREAM_BG, BORDER, CARD_SHADOW, TEXT_MUTED, TEXT_BODY, DANGER, DANGER_BG, DANGER_BORDER } from '../theme';

const ROLE_FILTERS = ['All', 'Student', 'Recruiter', 'Admin'];

// Admin Module — platform-wide metrics, user management (suspend/activate),
// and job listing moderation. Reorganized into tabs so the two very
// different jobs (people vs. postings) don't compete for space on one
// long page. Restyled to the app's cream/green/amber identity instead of
// the old blue theme, and a "Recent Users" panel added up top — all real
// data from /AdminControllerADC1/users, just the newest few.
function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'listings'

  const [users, setUsers] = useState([]);
  const [postings, setPostings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPostings, setLoadingPostings] = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [postingSearch, setPostingSearch] = useState('');

  const loadUsers = () => {
    setLoadingUsers(true);
    axiosClient
      .get('/AdminControllerADC1/users')
      .then((response) => setUsers(response.data))
      .finally(() => setLoadingUsers(false));
  };

  const loadPostings = () => {
    setLoadingPostings(true);
    axiosClient
      .get('/JobPostingControllerJPC1')
      .then((response) => setPostings(response.data))
      .finally(() => setLoadingPostings(false));
  };

  useEffect(() => {
    loadUsers();
    loadPostings();
  }, []);

  const toggleUserStatus = async (user) => {
    try {
      await axiosClient.put(`/AdminControllerADC1/users/${user.id}/status`, {
        isActive: !user.isActive,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update user status');
    }
  };

  const deletePosting = async (id) => {
    if (!window.confirm('Remove this job posting from the platform?')) return;
    try {
      await axiosClient.delete(`/AdminControllerADC1/jobposting/${id}`);
      setPostings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this posting');
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, userSearch, roleFilter]);

  const filteredPostings = useMemo(() => {
    const q = postingSearch.trim().toLowerCase();
    if (!q) return postings;
    return postings.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q)
    );
  }, [postings, postingSearch]);

  const recentUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [users]
  );

  const suspendedCount = users.filter((u) => !u.isActive).length;

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Admin Panel</h1>
        <p style={styles.pageSubtitle}>Platform-wide oversight — users and job listings.</p>

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>{users.length}</p>
            <p style={styles.metricLabel}>Total Users</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>{users.filter((u) => u.role === 'Student').length}</p>
            <p style={styles.metricLabel}>Students</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>{users.filter((u) => u.role === 'Recruiter').length}</p>
            <p style={styles.metricLabel}>Recruiters</p>
          </div>
          <div style={styles.metricCard}>
            <p style={{ ...styles.metricValue, ...(suspendedCount > 0 ? styles.metricValueWarn : {}) }}>
              {suspendedCount}
            </p>
            <p style={styles.metricLabel}>Suspended</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>{postings.length}</p>
            <p style={styles.metricLabel}>Job Postings</p>
          </div>
        </div>

        <div style={styles.recentCard}>
          <h3 style={styles.recentTitle}>Recent Users</h3>
          {loadingUsers && <p style={styles.loadingText}>Loading...</p>}
          {!loadingUsers && recentUsers.length === 0 && (
            <p style={styles.loadingText}>No users yet.</p>
          )}
          {!loadingUsers && recentUsers.length > 0 && (
            <div style={styles.recentList}>
              {recentUsers.map((u) => (
                <div key={u.id} style={styles.recentRow}>
                  <div style={styles.recentAvatar}>{u.name?.[0]?.toUpperCase() || '?'}</div>
                  <div style={styles.recentInfo}>
                    <span style={styles.recentName}>{u.name}</span>
                    <span style={styles.recentMeta}>
                      {u.role} · {u.email}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.statusPill,
                      ...(u.isActive ? styles.statusActive : styles.statusSuspended),
                    }}
                  >
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.tabRow}>
          <button
            onClick={() => setActiveTab('users')}
            style={{ ...styles.tabButton, ...(activeTab === 'users' ? styles.tabButtonActive : {}) }}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            style={{ ...styles.tabButton, ...(activeTab === 'listings' ? styles.tabButtonActive : {}) }}
          >
            Listing Moderation
          </button>
        </div>

        {activeTab === 'users' && (
          <div>
            <div style={styles.toolbar}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={styles.searchInput}
              />
              <div style={styles.filterChips}>
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    style={{
                      ...styles.filterChip,
                      ...(roleFilter === r ? styles.filterChipActive : {}),
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {loadingUsers && <p style={styles.loadingText}>Loading...</p>}

            {!loadingUsers && filteredUsers.length === 0 && (
              <p style={styles.loadingText}>No users match this search.</p>
            )}

            {!loadingUsers && filteredUsers.length > 0 && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Joined</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={styles.td}>{u.name}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.rolePill, ...styles[`role${u.role}`] }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusPill,
                              ...(u.isActive ? styles.statusActive : styles.statusSuspended),
                            }}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => toggleUserStatus(u)}
                            style={u.isActive ? styles.dangerButton : styles.secondaryButton}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <div style={styles.toolbar}>
              <input
                type="text"
                placeholder="Search by title or location..."
                value={postingSearch}
                onChange={(e) => setPostingSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {loadingPostings && <p style={styles.loadingText}>Loading...</p>}
            {!loadingPostings && filteredPostings.length === 0 && (
              <p style={styles.loadingText}>No job postings match this search.</p>
            )}

            <div style={styles.list}>
              {filteredPostings.map((posting) => (
                <div key={posting.id} style={styles.postingCard}>
                  <div style={styles.postingMain}>
                    <h3 style={styles.postingTitle}>{posting.title}</h3>
                    <div style={styles.postingMetaRow}>
                      {posting.location && <span style={styles.postingMeta}>📍 {posting.location}</span>}
                      {posting.stipend != null && (
                        <span style={styles.postingMeta}>💰 {posting.stipend}/mo</span>
                      )}
                      <span style={styles.postingMeta}>
                        🗓 Posted {new Date(posting.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {posting.requiredSkills && (
                      <div style={styles.skillsRow}>
                        {posting.requiredSkills.split(',').map((skill, i) => (
                          <span key={i} style={styles.skillTag}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deletePosting(posting.id)} style={styles.dangerButton}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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

  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: GREEN_DARK,
    margin: '0 0 4px',
  },

  pageSubtitle: {
    fontSize: '15px',
    color: TEXT_MUTED,
    margin: '0 0 24px',
  },

  loadingText: {
    color: TEXT_MUTED,
    fontSize: '14px',
  },

  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },

  metricCard: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '18px',
    textAlign: 'center',
    boxShadow: CARD_SHADOW,
  },

  metricValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: OLIVE,
    margin: '0 0 4px',
  },

  metricValueWarn: {
    color: DANGER,
  },

  metricLabel: {
    fontSize: '12px',
    color: TEXT_MUTED,
    margin: 0,
  },

  recentCard: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '22px',
    boxShadow: CARD_SHADOW,
    marginBottom: '28px',
  },

  recentTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 14px',
  },

  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  recentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  recentAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#F8F6F1',
    border: `1px solid ${BORDER}`,
    color: OLIVE,
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  recentInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },

  recentName: {
    fontSize: '13px',
    fontWeight: '700',
    color: GREEN_DARK,
  },

  recentMeta: {
    fontSize: '12px',
    color: TEXT_MUTED,
  },

  tabRow: {
    display: 'flex',
    gap: '8px',
    borderBottom: `1px solid ${BORDER}`,
    marginBottom: '20px',
  },

  tabButton: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '10px 4px',
    marginRight: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: TEXT_MUTED,
    cursor: 'pointer',
  },

  tabButtonActive: {
    color: GREEN_DARK,
    borderBottom: `2px solid ${AMBER}`,
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },

  searchInput: {
    flex: '1 1 240px',
    padding: '9px 14px',
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    fontSize: '13px',
    background: '#FFFFFF',
    color: GREEN_DARK,
    outline: 'none',
  },

  filterChips: {
    display: 'flex',
    gap: '6px',
  },

  filterChip: {
    background: '#F8F6F1',
    color: TEXT_BODY,
    border: `1px solid ${BORDER}`,
    borderRadius: '999px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  filterChipActive: {
    background: GREEN_DARK,
    color: '#FFFFFF',
    border: `1px solid ${GREEN_DARK}`,
  },

  tableWrapper: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  th: {
    textAlign: 'left',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: TEXT_MUTED,
    padding: '12px 16px',
    borderBottom: `1px solid ${BORDER}`,
    whiteSpace: 'nowrap',
  },

  td: {
    fontSize: '13px',
    color: GREEN_DARK,
    padding: '12px 16px',
    borderBottom: '1px solid #F1EEE6',
    whiteSpace: 'nowrap',
  },

  rolePill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '999px',
  },

  roleStudent: {
    background: '#EAF2ED',
    color: OLIVE,
  },

  roleRecruiter: {
    background: '#E8EFE9',
    color: GREEN_DARK,
  },

  roleAdmin: {
    background: '#FCEEDD',
    color: AMBER_DARK,
  },

  statusPill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '999px',
  },

  statusActive: {
    background: '#EAF2ED',
    color: OLIVE,
  },

  statusSuspended: {
    background: DANGER_BG,
    color: DANGER,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  postingCard: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    padding: '16px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },

  postingMain: {
    flex: 1,
    minWidth: 0,
  },

  postingTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 6px',
  },

  postingMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '8px',
  },

  postingMeta: {
    fontSize: '12px',
    color: TEXT_MUTED,
  },

  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },

  skillTag: {
    background: '#F8F6F1',
    color: GREEN_DARK,
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 9px',
    borderRadius: '20px',
    border: `1px solid ${BORDER}`,
  },

  secondaryButton: {
    background: '#F8F6F1',
    color: GREEN_DARK,
    border: `1px solid ${BORDER}`,
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  dangerButton: {
    background: DANGER_BG,
    color: DANGER,
    border: `1px solid ${DANGER_BORDER}`,
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

export default AdminPanelPage;
