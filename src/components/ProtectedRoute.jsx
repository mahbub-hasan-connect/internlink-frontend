import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Wrap any <Route element={...}> with this to require login, and optionally
// a specific role. Usage:
//   <Route path="/profile" element={<ProtectedRoute roles={['Student']}><StudentProfilePage /></ProtectedRoute>} />
function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Logged in, but wrong role (e.g. a Recruiter hitting a Student-only page)
    return <Navigate to="/jobs" replace />;
  }

  return children;
}

export default ProtectedRoute;
