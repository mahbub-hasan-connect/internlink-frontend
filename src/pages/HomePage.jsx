import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Small line-icon set for the hero mock window's step list. Plain inline
// SVGs instead of emoji — emoji glyphs render inconsistently (or as the
// wrong picture entirely) across OS/browser combos, which is exactly what
// made the earlier icons not clearly match their labels. These are drawn
// the same way every time.
function StepIconBase({ children, color = '#16241D', size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Document with lines — a posting going out.
const PostedIcon = (props) => (
  <StepIconBase {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </StepIconBase>
);

// Paper plane — an application being sent off.
const AppliedIcon = (props) => (
  <StepIconBase {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </StepIconBase>
);

// Target/bullseye — the AI match score.
const MatchIcon = ({ color = '#16241D', size = 17 }) => (
  <StepIconBase color={color} size={size}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5.5" />
    <circle cx="12" cy="12" r="1.8" fill={color} stroke="none" />
  </StepIconBase>
);

// Microphone — the interview stage.
const InterviewIcon = (props) => (
  <StepIconBase {...props}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="8.5" y1="22" x2="15.5" y2="22" />
  </StepIconBase>
);

// Check inside a circle — hired.
const HiredIcon = (props) => (
  <StepIconBase {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </StepIconBase>
);

// The hero mock window's step list — tells the whole InternLink story at a
// glance: a posting goes out, a student applies, the AI match score kicks
// in (highlighted — it's the step the floating score card points at), then
// interview → hired.
const HERO_STEPS = [
  { Icon: PostedIcon, label: 'Internship Posted' },
  { Icon: AppliedIcon, label: 'Application Sent' },
  { Icon: MatchIcon, label: 'AI Match Score', active: true },
  { Icon: InterviewIcon, label: 'Interview' },
  { Icon: HiredIcon, label: 'Hired' },
];

// Public landing page — same warm cream / forest-green / amber identity as
// the Login/Register pages, styled after the InternLink brand reference.
//
// Layout, top to bottom: a FIXED nav bar (stays put while scrolling) → hero
// (first screen: headline + Search/Post CTAs + trust line) → "How It Works"
// (3-step row, deep-linkable from the nav) → the existing "Why InternLink"
// section → footer (quick links, legal, credit line).
function HomePage() {
  const [listingCount, setListingCount] = useState(null);

  useEffect(() => {
    // GET /JobPostingControllerJPC1 is public — show the real, live count
    // instead of a hardcoded placeholder number.
    axiosClient
      .get('/JobPostingControllerJPC1')
      .then((response) => setListingCount(response.data.length))
      .catch(() => setListingCount(null));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.blobOrange} />
      <div style={styles.blobGreen} />

      {/* Fixed nav — position:fixed so it never scrolls away. No separate
          "Log in" link anymore: "Get Started" itself goes to /login, and
          Register is still one click away from there. */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link to="/" style={styles.brand}>
            <span style={styles.brandLight}>Intern</span>
            <span style={styles.brandAccent}>Link</span>
          </Link>

          <nav style={styles.nav}>
            <Link to="/" style={{ ...styles.navLink, ...styles.navLinkActive }}>
              Home
            </Link>
            <Link to="/jobs" style={styles.navLink}>
              Internships
            </Link>
            <a href="#how-it-works" style={styles.navLink}>
              How it Works
            </a>
            <Link to="/login" style={styles.getStartedBtn}>
              Get Started →
            </Link>
          </nav>
        </div>
      </header>

      {/* Spacer so hero content doesn't start underneath the fixed header */}
      <div style={styles.headerSpacer} />

      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.chip}>
            <span style={styles.chipAvatars}>
              <span style={{ ...styles.chipAvatar, background: '#E8703A', marginLeft: 0 }} />
              <span style={{ ...styles.chipAvatar, background: '#1B3B2F' }} />
              <span style={{ ...styles.chipAvatar, background: '#D97706' }} />
            </span>
            Join students &amp; recruiters already matching
          </div>

          <h1 style={styles.headline}>
            Find Your
            <br />
            Next <span style={styles.headlineAccent}>Internship</span>
          </h1>

          <p style={styles.heroText}>
            InternLink connects students with recruiters through automated
            resume parsing, a real-time application tracker, and an AI
            Match score — all in one place.
          </p>

          {/* Primary CTAs — the two things every visitor comes here to do:
              find an internship, or post one. No login required to search. */}
          <div style={styles.ctaRow}>
            <Link to="/jobs" style={styles.primaryButton}>
              🔍 Search an Internship
            </Link>
            <Link to="/login" style={styles.secondaryButton}>
              📢 Post an Internship
            </Link>
          </div>

          <p style={styles.trustLine}>Trusted by students and companies across the world</p>

          <p style={styles.statLine}>
            <span style={styles.statDot} />
            {listingCount !== null
              ? `${listingCount}+ live listings right now`
              : 'Live listings updating in real time'}
          </p>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.mockWindow}>
            <div style={styles.mockWindowBar}>
              <span style={styles.mockDot} />
              <span style={styles.mockDot} />
              <span style={styles.mockDot} />
            </div>

            {/* The InternLink journey, top to bottom — posting → apply →
                AI match (highlighted) → interview → hired. */}
            <div style={styles.mockStepsWrap}>
              <div style={styles.mockStepsLine} />
              <div style={styles.mockStepsList}>
                {HERO_STEPS.map((step) => {
                  const StepIcon = step.Icon;
                  const isActive = !!step.active;
                  return (
                    <div key={step.label} style={styles.mockStepRow}>
                      <div style={{ ...styles.mockStepIcon, ...(isActive ? styles.mockStepIconActive : {}) }}>
                        <StepIcon color={isActive ? MATCH_GREEN : GREEN_DARK} size={17} />
                      </div>
                      <span style={{ ...styles.mockStepLabel, ...(isActive ? styles.mockStepLabelActive : {}) }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p style={styles.mockCongrats}>Congratulations! You&apos;re on your way to success!</p>
          </div>

          {/* Graduation-cap badge overlapping the card's top-right corner. */}
          <div style={styles.floatingAvatar}>🎓</div>

          {/* Dashed curve connecting the highlighted "AI Match Score" row to
              the floating score card, same idea as the reference mock. */}
          <svg style={styles.mockConnector} viewBox="0 0 90 60" fill="none">
            <path
              d="M4 14 C 46 14, 40 46, 86 48"
              stroke={MATCH_GREEN}
              strokeWidth="2"
              strokeDasharray="4 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Floating "AI Match Score" card — label, big percentage, and a
              filled progress bar — connected to the row above by the curve. */}
          <div style={styles.matchCard}>
            <span style={styles.matchCardLabel}>AI Match Score</span>
            <span style={styles.matchCardValue}>92%</span>
            <div style={styles.matchCardTrack}>
              <div style={styles.matchCardFill} />
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" — the nav's "How it Works" link jumps straight here. */}
      <section id="how-it-works" style={styles.howItWorks}>
        <p style={styles.howItWorksEyebrow}>How It Works</p>
        <h2 style={styles.howItWorksTitle}>Three steps to your next opportunity</h2>

        <div style={styles.stepsRow}>
          <div style={styles.stepCard}>
            <span style={styles.stepNumber}>1</span>
            <h3 style={styles.stepTitle}>Create Your Account</h3>
            <p style={styles.stepText}>Sign up as a student or company.</p>
          </div>

          <div style={styles.stepCard}>
            <span style={styles.stepNumber}>2</span>
            <h3 style={styles.stepTitle}>Browse or Post Internships</h3>
            <p style={styles.stepText}>
              Students discover verified listings. Companies post opportunities
              directly.
            </p>
          </div>

          <div style={styles.stepCard}>
            <span style={styles.stepNumber}>3</span>
            <h3 style={styles.stepTitle}>Connect &amp; Grow</h3>
            <p style={styles.stepText}>
              Apply automatically, track progress, and land your dream job.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.featuresLeft}>
          <p style={styles.featuresEyebrow}>Why InternLink</p>
          <h2 style={styles.featuresTitle}>
            Built to fix the <span style={styles.headlineAccent}>application black hole</span>
          </h2>
          <p style={styles.featuresSubtext}>
            No more applying into silence — every step of the process is visible,
            for both students and recruiters.
          </p>

          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>⚡</span>
            <div>
              <p style={styles.featureItemTitle}>Smart Skill Matcher</p>
              <p style={styles.featureItemText}>
                Smart matching compares your skills to each job post and shows
                a clear match percentage before you apply.
              </p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>📍</span>
            <div>
              <p style={styles.featureItemTitle}>Real-Time Tracker</p>
              <p style={styles.featureItemText}>
                Watch your application move through Applied → Shortlisted →
                Interview → Offered → Hired.
              </p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>🛡️</span>
            <div>
              <p style={styles.featureItemTitle}>Verified Companies</p>
              <p style={styles.featureItemText}>
                Every recruiter listing is reviewed by admins to keep the
                platform free of spam and fake postings.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.quickStartCard}>
          <div style={styles.quickStartIconWrap}>📬</div>
          <h3 style={styles.quickStartTitle}>Get Started in Minutes</h3>
          <p style={styles.quickStartText}>
            Whether you're hunting for an internship or hiring your next intern —
            create your account and you're in.
          </p>

          <Link to="/register" style={styles.quickStartButton}>
            I'm a Student →
          </Link>
          <Link to="/register" style={styles.quickStartButtonOutline}>
            I'm a Recruiter →
          </Link>
        </div>
      </section>

      {/* Footer — short blurb, quick links, legal, and the credit line. */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrandCol}>
            <span style={styles.footerBrand}>
              <span style={styles.brandLight}>Intern</span>
              <span style={styles.brandAccent}>Link</span>
            </span>
            <p style={styles.footerBlurb}>
              Connecting students with verified internship opportunities, and
              helping companies find great talent — faster, and with a clear
              status at every step.
            </p>
          </div>

          <div style={styles.footerCol}>
            <p style={styles.footerColTitle}>Quick Links</p>
            <Link to="/" style={styles.footerLink}>
              Home
            </Link>
            <a href="#how-it-works" style={styles.footerLink}>
              About Us
            </a>
            <a href="mailto:support@internlink.com" style={styles.footerLink}>
              Contact
            </a>
          </div>

          <div style={styles.footerCol}>
            <p style={styles.footerColTitle}>Legal</p>
            <a href="#" style={styles.footerLink}>
              Privacy Policy
            </a>
            <a href="#" style={styles.footerLink}>
              Terms &amp; Conditions
            </a>
          </div>
        </div>

        <div style={styles.footerDivider} />

        <div style={styles.footerBottom}>
          <p style={styles.footerBottomText}>
            © {new Date().getFullYear()} InternLink. All rights reserved.
          </p>
          <p style={styles.footerBottomText}>Developed by Mahbub Hasan</p>
        </div>
      </footer>
    </div>
  );
}

const GREEN = '#1B3B2F';
const GREEN_DARK = '#16241D';
const OLIVE = '#3F6B4A';
const AMBER = '#D97706';
const AMBER_DARK = '#B45309';
// A brighter, more "success" green than the muted brand GREEN/OLIVE —
// reserved for the AI Match Score highlight (icon, label, score card).
const MATCH_GREEN = '#16A34A';
const MATCH_GREEN_BG = 'rgba(22, 163, 74, 0.12)';
const MATCH_GREEN_BORDER = 'rgba(22, 163, 74, 0.28)';
// Bumped up so the nav bar reads wider/roomier — more horizontal breathing
// room in the bar itself (maxWidth below) and more top/bottom padding
// inside it, per feedback that the nav felt cramped.
const NAV_HEIGHT = 92;

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #F8F6F1 0%, #F0EDE4 100%)',
    fontFamily: 'system-ui, sans-serif',
  },

  // Soft radial-gradient glows instead of a solid circle + CSS blur filter —
  // large blur() radii render as solid black blocks in some browser/GPU
  // combinations, a radial-gradient gives the same soft-glow look reliably.
  blobOrange: {
    position: 'absolute',
    top: '-140px',
    right: '-120px',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(232,112,58,0.28) 0%, rgba(232,112,58,0) 70%)',
    pointerEvents: 'none',
  },

  blobGreen: {
    position: 'absolute',
    top: '500px',
    left: '-160px',
    width: '440px',
    height: '440px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(47,82,51,0.22) 0%, rgba(47,82,51,0) 70%)',
    pointerEvents: 'none',
  },

  // Fixed — stays pinned to the top of the viewport regardless of scroll.
  // Solid dark-green background (not transparent) so it reads clearly over
  // whatever content scrolls underneath it.
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: GREEN,
    boxShadow: '0 2px 16px rgba(22, 36, 29, 0.18)',
  },

  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // More horizontal room (wider maxWidth + side padding) and more
    // top/bottom padding so the bar has real vertical breathing space
    // instead of hugging the links tightly.
    padding: '26px 64px',
    maxWidth: '1360px',
    margin: '0 auto',
  },

  headerSpacer: {
    height: `${NAV_HEIGHT}px`,
  },

  brand: {
    fontSize: '23px',
    fontWeight: '800',
    textDecoration: 'none',
  },

  brandLight: { color: '#FFFFFF' },
  brandDark: { color: GREEN_DARK },
  brandAccent: { color: AMBER },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  navLink: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    padding: '13px 20px',
    borderRadius: '999px',
  },

  // Marks "Home" as the current page — this component only ever renders on
  // the homepage, so it's always the active link.
  navLinkActive: {
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.16)',
  },

  getStartedBtn: {
    background: AMBER,
    color: '#FFFFFF',
    padding: '15px 28px',
    borderRadius: '999px',
    fontSize: '18px',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '10px',
  },

  // Filling the first screen: minHeight makes the hero take up exactly the
  // remaining viewport below the fixed header, so on a fresh page load
  // (before any scrolling) nothing of "How It Works" peeks in at the
  // bottom — the visitor sees only the hero, and has to actually scroll
  // to bring the next section into view.
  hero: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '40px 48px 60px',
    minHeight: `calc(100vh - ${NAV_HEIGHT}px)`,
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '48px',
    alignItems: 'center',
  },

  heroLeft: {},

  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #EDE9DF',
    borderRadius: '999px',
    padding: '10px 20px 10px 12px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#44403C',
    marginBottom: '24px',
  },

  chipAvatars: {
    display: 'flex',
  },

  chipAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    marginLeft: '-8px',
    display: 'inline-block',
  },

  headline: {
    fontSize: '52px',
    fontWeight: '800',
    lineHeight: '1.08',
    color: GREEN_DARK,
    margin: '0 0 20px',
  },

  headlineAccent: {
    color: OLIVE,
  },

  heroText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#57534E',
    lineHeight: '1.65',
    maxWidth: '480px',
    margin: '0 0 32px',
  },

  ctaRow: {
    display: 'flex',
    gap: '14px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },

  primaryButton: {
    background: GREEN,
    color: '#FFFFFF',
    padding: '16px 30px',
    borderRadius: '999px',
    fontSize: '18px',
    fontWeight: '700',
    textDecoration: 'none',
  },

  secondaryButton: {
    background: '#FFFFFF',
    color: GREEN_DARK,
    border: '1px solid #E7E2D9',
    padding: '16px 30px',
    borderRadius: '999px',
    fontSize: '18px',
    fontWeight: '700',
    textDecoration: 'none',
  },

  trustLine: {
    fontSize: '18px',
    color: '#78716C',
    fontWeight: '600',
    margin: '0 0 10px',
  },

  statLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    color: '#78716C',
    fontWeight: '600',
    margin: 0,
  },

  statDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: AMBER,
    display: 'inline-block',
  },

  heroRight: {
    position: 'relative',
  },

  mockWindow: {
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #EDE9DF',
    boxShadow: '0 30px 70px rgba(27, 59, 47, 0.15)',
    overflow: 'hidden',
  },

  mockWindowBar: {
    display: 'flex',
    gap: '6px',
    padding: '14px 18px',
    borderBottom: '1px solid #F1EEE6',
  },

  mockDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background: '#E7E2D9',
    display: 'inline-block',
  },

  // The step-by-step journey shown inside the mock window: posting → apply
  // → AI match → interview → hired → success, connected by a vertical line.
  mockStepsWrap: {
    position: 'relative',
    padding: '28px 26px',
  },

  mockStepsLine: {
    position: 'absolute',
    left: '43px',
    top: '45px',
    bottom: '45px',
    width: '2px',
    background: '#EDE9DF',
  },

  mockStepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  mockStepRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  mockStepIcon: {
    position: 'relative',
    zIndex: 1,
    width: '36px',
    height: '36px',
    flexShrink: 0,
    borderRadius: '50%',
    background: '#F8F6F1',
    border: '1px solid #EDE9DF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },

  // The "AI Match Score" row — highlighted so it's obvious which step the
  // floating score card (connected by the dashed curve) is pointing at.
  mockStepIconActive: {
    background: MATCH_GREEN_BG,
    border: `1px solid ${MATCH_GREEN_BORDER}`,
  },

  mockStepLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: GREEN_DARK,
  },

  mockStepLabelActive: {
    color: MATCH_GREEN,
    fontWeight: '800',
  },

  // Orange "you made it" line at the bottom of the mock card, under the step
  // list — the payoff of the whole journey shown above it.
  mockCongrats: {
    fontSize: '18px',
    fontWeight: '800',
    color: AMBER_DARK,
    margin: '-6px 0 0',
    padding: '0 26px 26px',
  },

  // Graduation-cap badge overlapping the card's top-right corner.
  floatingAvatar: {
    position: 'absolute',
    top: '-18px',
    right: '-18px',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#E8703A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 10px 24px rgba(232, 112, 58, 0.35)',
    zIndex: 2,
  },

  // Decorative dashed curve linking the "AI Match Score" row to the floating
  // score card — purely visual, so it's positioned with fixed offsets like
  // the other floating pieces rather than measured against the row.
  mockConnector: {
    position: 'absolute',
    top: '150px',
    right: '-58px',
    width: '90px',
    height: '60px',
    pointerEvents: 'none',
  },

  matchCard: {
    position: 'absolute',
    top: '170px',
    right: '-28px',
    background: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #EDE9DF',
    boxShadow: '0 18px 40px rgba(27, 59, 47, 0.14)',
    padding: '14px 18px',
    width: '150px',
    display: 'flex',
    flexDirection: 'column',
  },

  matchCardLabel: {
    fontSize: '14px',
    color: '#78716C',
    fontWeight: '600',
    marginBottom: '2px',
  },

  matchCardValue: {
    fontSize: '26px',
    color: MATCH_GREEN,
    fontWeight: '800',
    marginBottom: '10px',
  },

  matchCardTrack: {
    width: '100%',
    height: '7px',
    borderRadius: '999px',
    background: '#EDE9DF',
    overflow: 'hidden',
  },

  matchCardFill: {
    width: '92%',
    height: '100%',
    borderRadius: '999px',
    background: MATCH_GREEN,
  },

  // "How It Works" — deep-linked from the nav via #how-it-works.
  // scrollMarginTop keeps the fixed header from covering the heading when
  // the browser jumps here, so clicking the nav link brings the section
  // fully and cleanly into view (not the hero section itself — that's
  // handled separately by giving the hero a fixed first-screen height).
  howItWorks: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '20px 48px 80px',
    textAlign: 'center',
    scrollMarginTop: `${NAV_HEIGHT + 16}px`,
  },

  // Sized to match the hero's "Find Your Next Internship" headline, per
  // request — bold and just as big, not a small uppercase label anymore.
  howItWorksEyebrow: {
    fontSize: '52px',
    fontWeight: '800',
    color: AMBER_DARK,
    textTransform: 'uppercase',
    letterSpacing: '0.01em',
    lineHeight: '1.1',
    margin: '0 0 20px',
  },

  howItWorksTitle: {
    fontSize: '30px',
    fontWeight: '800',
    color: GREEN_DARK,
    margin: '0 0 48px',
  },

  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '28px',
    textAlign: 'left',
  },

  stepCard: {
    background: '#FFFFFF',
    border: '1px solid #EDE9DF',
    borderRadius: '18px',
    padding: '28px 24px',
    boxShadow: '0 16px 40px rgba(27, 59, 47, 0.08)',
  },

  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: GREEN,
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '800',
    marginBottom: '16px',
  },

  stepTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 8px',
  },

  stepText: {
    fontSize: '18px',
    color: '#78716C',
    lineHeight: '1.55',
    margin: 0,
  },

  features: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '20px 48px 100px',
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '56px',
    alignItems: 'start',
  },

  featuresLeft: {},

  // Matches howItWorksEyebrow's size exactly, per request — both section
  // eyebrows now read at the same big, bold size as the hero headline.
  featuresEyebrow: {
    fontSize: '52px',
    fontWeight: '800',
    color: AMBER_DARK,
    textTransform: 'uppercase',
    letterSpacing: '0.01em',
    lineHeight: '1.1',
    margin: '0 0 10px',
    textAlign: 'center',
  },

  featuresTitle: {
    fontSize: '30px',
    fontWeight: '800',
    color: GREEN_DARK,
    lineHeight: '1.25',
    margin: '0 0 14px',
    textAlign: 'left',
  },

  featuresSubtext: {
    fontSize: '18px',
    color: '#57534E',
    lineHeight: '1.6',
    margin: '0 0 32px',
    maxWidth: '460px',
  },

  featureItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '26px',
  },

  featureIcon: {
    fontSize: '22px',
    background: '#FFFFFF',
    border: '1px solid #EDE9DF',
    borderRadius: '12px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  featureItemTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: GREEN_DARK,
    margin: '0 0 4px',
  },

  featureItemText: {
    fontSize: '18px',
    color: '#78716C',
    lineHeight: '1.5',
    margin: 0,
  },

  quickStartCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #EDE9DF',
    boxShadow: '0 24px 60px rgba(27, 59, 47, 0.1)',
    padding: '32px',
    textAlign: 'center',
  },

  quickStartIconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#F0EDE4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    margin: '0 auto 18px',
  },

  quickStartTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: GREEN_DARK,
    margin: '0 0 10px',
  },

  quickStartText: {
    fontSize: '18px',
    color: '#78716C',
    lineHeight: '1.5',
    margin: '0 0 24px',
  },

  quickStartButton: {
    display: 'block',
    background: GREEN,
    color: '#FFFFFF',
    padding: '13px',
    borderRadius: '999px',
    fontSize: '18px',
    fontWeight: '700',
    textDecoration: 'none',
    marginBottom: '10px',
  },

  quickStartButtonOutline: {
    display: 'block',
    background: '#FFFFFF',
    color: GREEN_DARK,
    border: '1px solid #E7E2D9',
    padding: '13px',
    borderRadius: '999px',
    fontSize: '18px',
    fontWeight: '700',
    textDecoration: 'none',
  },

  // Footer — dark-green like the nav, so the page opens and closes on the
  // same brand color.
  footer: {
    position: 'relative',
    zIndex: 1,
    background: GREEN_DARK,
    padding: '56px 48px 32px',
  },

  footerTop: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr',
    gap: '40px',
  },

  footerBrandCol: {
    maxWidth: '340px',
  },

  footerBrand: {
    fontSize: '20px',
    fontWeight: '800',
  },

  footerBlurb: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: '1.6',
    margin: '14px 0 0',
  },

  footerColTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 16px',
  },

  footerLink: {
    display: 'block',
    fontSize: '18px',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    marginBottom: '12px',
  },

  footerDivider: {
    maxWidth: '1180px',
    margin: '40px auto 24px',
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },

  footerBottom: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },

  footerBottomText: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
};

export default HomePage;
