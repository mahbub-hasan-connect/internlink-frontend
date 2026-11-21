// Small helper to read the payload out of a JWT without adding a new npm
// dependency (jwt-decode etc.). We never verify the signature on the client
// — the backend already did that — this is purely for reading claims like
// role/email/userId so the UI can react to them.
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    // JWT uses base64url — swap the URL-safe chars back before atob()
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// The backend puts claims in .NET's long ClaimTypes URIs, not short names.
// This maps them to the plain { userId, email, role } shape the frontend wants.
const CLAIM_NAMEIDENTIFIER = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

export function getUserFromToken(token) {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    userId: payload[CLAIM_NAMEIDENTIFIER] ?? payload.sub ?? null,
    email: payload[CLAIM_EMAIL] ?? payload.email ?? null,
    role: payload[CLAIM_ROLE] ?? payload.role ?? null,
    // Only present on tokens issued after the Name claim was added to the
    // backend — older tokens (still valid until they expire) won't have
    // this, so callers should fall back to email when it's missing.
    name: payload[CLAIM_NAME] ?? payload.name ?? null,
  };
}

export function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
