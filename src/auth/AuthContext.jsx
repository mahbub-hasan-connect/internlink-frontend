import { createContext, useContext, useState, useCallback } from 'react';
import { getUserFromToken, isTokenExpired } from './jwt';

const AuthContext = createContext(null);

// Reads whatever token is already in localStorage (e.g. after a page reload)
// and turns it back into a { userId, email, role } object, or null.
function loadUserFromStorage() {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    return null;
  }
  return getUserFromToken(token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUserFromStorage);

  // Call this right after a successful /login or /register response.
  // Both endpoints hand back a JWT — decoding it is all we need to know
  // who's logged in and what role they have.
  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    setUser(getUserFromToken(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
