import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../auth/AuthContext';
import AppHeader from '../components/AppHeader';
import { GREEN, GREEN_DARK, OLIVE, AMBER, AMBER_DARK, CREAM_BG, BORDER, CARD_SHADOW, TEXT_MUTED, TEXT_BODY } from '../theme';

// Job Listings page — displays all available job postings.
// GET /api/JobPostingControllerJPC1 is public, so this works for anyone,
// but the match %/Apply button only make sense for a logged-in Student.
//
// Layout: an "Explore Internships" hero + search + category filter pills +
// card grid (structure inspired by the internlink-website.vercel.app
// reference screenshot the user shared early on). Originally styled dark
// navy to match that reference directly, but that read as an odd, jarring
// switch coming from the cream/green/amber Home page — so it's now styled
// with the same brand tokens as Home instead, just like every other in-app
// page. AppHeader (shared nav) is kept as-is.
const CATEGORY_RULES = [
  { key: 'Mobile App Development', match: ['android', 'ios', 'flutter', 'react native', 'kotlin', 'swift', 'mobile app'] },
  { key: 'UI/UX Design', match: ['ui/ux', 'ux design', 'ui design', 'figma', 'adobe xd', 'sketch', 'prototyp', 'wireframe'] },
  { key: 'AI/Machine Learning', match: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'artificial intelligence', 'ai/ml'] },
  { key: 'Data Science', match: ['data science', 'data analysis', 'data analyst', 'pandas', 'numpy', 'statistics', 'data visualization', 'power bi'] },
  { key: 'Digital Marketing', match: ['marketing', 'seo', 'social media', 'content writing', 'advertising', 'copywriting'] },
  { key: 'Human Resources (HR)', match: ['human resources', 'recruitment', 'talent acquisition', ' hr ', 'hr,', 'hr '] },
  { key: 'Web Development', match: ['react', 'javascript', 'html', 'css', 'node', 'frontend', 'backend', 'angular', 'vue', 'php', 'django', 'laravel', 'full stack', 'web developer', '.net', 'java'] },
];

function deriveCategory(posting) {
  const text = `${posting.title || ''} ${posting.requiredSkills || ''}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.match.some((keyword) => text.includes(keyword))) {
      return rule.key;
    }
  }
  return 'Other';
}

function formatPostedAgo(postedAt) {
  if (!postedAt) return null;
  const days = Math.floor((Date.now() - new Date(postedAt).getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Posted ${months} month${months > 1 ? 's' : ''} ago`;
}

function JobListingsPage() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({}); // { [jobPostingId]: MatchResultResponseMRR1 }
  const [applied, setApplied] = useState({}); // { [jobPostingId]: true } — locally tracked so the button disables right after Apply
  const [applyError, setApplyError] = useState({}); // { [jobPostingId]: message }
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { user } = useAuth();
  const isStudent = user?.role === 'Student';

  useEffect(() => {
    axiosClient
      .get('/JobPostingControllerJPC1')
      .then((response) => {
        setPostings(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Once postings are in and we know this is a Student, fetch each posting's
  // match % in parallel so the "Smart Score Guidance" from the proposal
  // shows up without the user having to ask for it.
  useEffect(() => {
    if (!isStudent || postings.length === 0) return;

    postings.forEach((posting) => {
      axiosClient
        .get(`/MatchControllerMTC1/${user.userId}/${posting.id}`)
        .then((response) => {
          setMatches((prev) => ({ ...prev, [posting.id]: response.data }));
        })
        .catch(() => {
          // No profile yet, or some other issue — just skip showing a score for this card
        });
    });
  }, [isStudent, postings, user?.userId]);

  const handleApply = async (jobPostingId) => {
    setApplyError((prev) => ({ ...prev, [jobPostingId]: '' }));
    try {
      await axiosClient.post('/ApplicationControllerAPC1', { jobPostingId });
      setApplied((prev) => ({ ...prev, [jobPostingId]: true }));
    } catch (err) {
      setApplyError((prev) => ({
        ...prev,
        [jobPostingId]: err.response?.data?.message || 'Could not apply',
      }));
    }
  };

  // Postings tagged with a derived category, computed once per postings change.
  const taggedPostings = useMemo(
    () => postings.map((posting) => ({ ...posting, _category: deriveCategory(posting) })),
    [postings]
  );

  // Only show filter pills for categories that actually exist in the data,
  // in a fixed, sensible order (matches the reference site's pill order).
  const availableCategories = useMemo(() => {
    const present = new Set(taggedPostings.map((p) => p._category));
    const ordered = CATEGORY_RULES.map((r) => r.key).filter((key) => present.has(key));
    if (present.has('Other')) ordered.push('Other');
    return ['All', ...ordered];
  }, [taggedPostings]);

  const filteredPostings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return taggedPostings.filter((posting) => {
      const matchesCategory = activeCategory === 'All' || posting._category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = `${posting.title} ${posting.description} ${posting.requiredSkills} ${posting.location}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [taggedPostings, search, activeCategory]);

  return (
    <div style={styles.page}>
      <AppHeader />

      <div style={styles.section}>
        <div style={styles.blobOrange} />
        <div style={styles.blobGreen} />

        <div style={styles.heroWrap}>
          <h1 style={styles.pageHeading}>
            Explore <span style={styles.pageHeadingAccent}>Internships</span>
          </h1>
          <p style={styles.pageSubtitle}>Find your perfect internship opportunity</p>

          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search internships or keywords..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.pillsRow}>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...styles.pill,
                  ...(activeCategory === cat ? styles.pillActive : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {!loading && (
            <p style={styles.countText}>
              Showing {filteredPostings.length} internship{filteredPostings.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div style={styles.content}>
          {loading && <p style={styles.loadingText}>Loading...</p>}

          {!loading && postings.length === 0 && (
            <p style={styles.loadingText}>No job postings available at the moment</p>
          )}

          {!loading && postings.length > 0 && filteredPostings.length === 0 && (
            <p style={styles.loadingText}>No internships match your search — try a different keyword or category.</p>
          )}

          <div style={styles.grid}>
            {filteredPostings.map((posting) => {
              const match = matches[posting.id];
              const postedAgo = formatPostedAgo(posting.postedAt);
              return (
                <div key={posting.id} style={styles.card}>
                  <span style={styles.categoryBadge}>{posting._category}</span>

                  <h3 style={styles.cardTitle}>{posting.title}</h3>

                  <p style={styles.cardDescription}>{posting.description}</p>

                  <div style={styles.skillsRow}>
                    {posting.requiredSkills.split(',').map((skill, i) => (
                      <span key={i} style={styles.skillTag}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>📍 {posting.location}</span>
                    <span style={styles.metaItem}>
                      💰 {posting.stipend ? `৳${posting.stipend} stipend` : 'Unpaid'}
                    </span>
                    {postedAgo && <span style={styles.metaItem}>🕐 {postedAgo}</span>}
                  </div>

                  {isStudent && match && (
                    <div style={styles.matchBox}>
                      <div style={styles.matchHeaderRow}>
                        <span style={styles.matchLabel}>Match Score</span>
                        <span style={styles.matchPercent}>{match.matchPercentage}%</span>
                      </div>
                      {match.missingSkills.length > 0 && (
                        <p style={styles.missingSkillsText}>
                          Missing: {match.missingSkills.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {isStudent && (
                    <>
                      <button
                        onClick={() => handleApply(posting.id)}
                        disabled={applied[posting.id]}
                        style={{
                          ...styles.applyButton,
                          ...(applied[posting.id] ? styles.applyButtonDisabled : {}),
                        }}
                      >
                        {applied[posting.id] ? 'Applied ✓' : 'Apply Now'}
                      </button>
                      {applyError[posting.id] && (
                        <p style={styles.applyError}>{applyError[posting.id]}</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
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

  section: {
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: '80px',
  },

  // Same soft glow blobs as the Home page, for visual continuity.
  blobOrange: {
    position: 'absolute',
    top: '-120px',
    right: '-100px',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,112,58,0.22) 0%, rgba(232,112,58,0) 70%)',
    pointerEvents: 'none',
  },

  blobGreen: {
    position: 'absolute',
    top: '260px',
    left: '-140px',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(47,82,51,0.16) 0%, rgba(47,82,51,0) 70%)',
    pointerEvents: 'none',
  },

  heroWrap: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '780px',
    margin: '0 auto',
    padding: '64px 24px 8px',
    textAlign: 'center',
  },

  pageHeading: {
    fontSize: '40px',
    fontWeight: '800',
    color: GREEN_DARK,
    margin: '0 0 12px',
  },

  pageHeadingAccent: {
    color: OLIVE,
  },

  pageSubtitle: {
    fontSize: '18px',
    color: TEXT_BODY,
    margin: '0 0 32px',
  },

  searchWrap: {
    position: 'relative',
    marginBottom: '22px',
  },

  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '15px',
    opacity: 0.6,
  },

  searchInput: {
    width: '100%',
    padding: '15px 20px 15px 46px',
    borderRadius: '999px',
    border: `1px solid ${BORDER}`,
    background: '#FFFFFF',
    color: GREEN_DARK,
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },

  pill: {
    background: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    color: GREEN_DARK,
    fontSize: '13px',
    fontWeight: '600',
    padding: '9px 18px',
    borderRadius: '999px',
    cursor: 'pointer',
  },

  pillActive: {
    background: GREEN,
    borderColor: GREEN,
    color: '#FFFFFF',
  },

  countText: {
    fontSize: '14px',
    color: TEXT_MUTED,
    fontWeight: '600',
    margin: '0 0 8px',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '32px 40px 0',
  },

  loadingText: {
    color: TEXT_MUTED,
    fontSize: '14px',
    textAlign: 'center',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },

  card: {
    background: '#FFFFFF',
    borderRadius: '18px',
    // Generous top/bottom padding so the cards have real breathing room,
    // not just cramped edge-to-edge content.
    padding: '30px 26px',
    border: `1px solid ${BORDER}`,
    boxShadow: CARD_SHADOW,
    display: 'flex',
    flexDirection: 'column',
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    background: 'rgba(217,119,6,0.12)',
    color: AMBER_DARK,
    fontSize: '11px',
    fontWeight: '700',
    padding: '5px 12px',
    borderRadius: '999px',
    marginBottom: '14px',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 10px',
  },

  cardDescription: {
    fontSize: '14px',
    color: TEXT_BODY,
    margin: '0 0 16px',
    lineHeight: '1.6',
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
    padding: '5px 12px',
    borderRadius: '20px',
    border: `1px solid ${BORDER}`,
  },

  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px',
    color: TEXT_MUTED,
    marginBottom: '18px',
  },

  metaItem: {
    display: 'block',
  },

  matchBox: {
    marginTop: '4px',
    marginBottom: '16px',
    padding: '12px 14px',
    background: 'rgba(63,107,74,0.08)',
    border: '1px solid rgba(63,107,74,0.25)',
    borderRadius: '10px',
  },

  matchHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  matchLabel: {
    fontSize: '12px',
    color: OLIVE,
    fontWeight: '600',
  },

  matchPercent: {
    fontSize: '16px',
    color: GREEN_DARK,
    fontWeight: '700',
  },

  missingSkillsText: {
    fontSize: '11px',
    color: TEXT_MUTED,
    margin: '6px 0 0',
  },

  applyButton: {
    width: '100%',
    marginTop: 'auto',
    padding: '13px',
    background: GREEN,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  applyButtonDisabled: {
    background: '#E7E2D9',
    color: TEXT_MUTED,
    cursor: 'default',
  },

  applyError: {
    color: '#DC2626',
    fontSize: '12px',
    marginTop: '8px',
  },
};

export default JobListingsPage;
