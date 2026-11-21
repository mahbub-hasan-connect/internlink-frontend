// Shared brand tokens — the cream / forest-green / amber identity that the
// public Home page uses. Every in-app page (Jobs, Student/Recruiter/Admin
// dashboards, AppHeader) imports these instead of redefining its own colors,
// so the whole app reads as one consistent design instead of drifting back
// into separate blue/dark-navy/etc. themes per page.
export const GREEN = '#1B3B2F';
export const GREEN_DARK = '#16241D';
export const OLIVE = '#3F6B4A';
export const AMBER = '#D97706';
export const AMBER_DARK = '#B45309';

export const CREAM_BG = 'linear-gradient(160deg, #F8F6F1 0%, #F0EDE4 100%)';
export const BORDER = '#EDE9DF';
export const CARD_BG = '#FFFFFF';
export const TEXT_MUTED = '#78716C';
export const TEXT_BODY = '#57534E';
export const CARD_SHADOW = '0 16px 40px rgba(27, 59, 47, 0.08)';

// A few semantic colors that don't come from the brand palette (status
// pills, warnings) but are still shared so every page uses the same red.
export const DANGER = '#DC2626';
export const DANGER_BG = '#FEF2F2';
export const DANGER_BORDER = '#FECACA';
