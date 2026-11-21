import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListingsPage from './pages/JobListingsPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import RecruiterDashboardPage from './pages/RecruiterDashboardPage';
import RecruiterApplicantsPage from './pages/RecruiterApplicantsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotificationsPage from './pages/NotificationsPage';

// App.jsx — পুরো app-এর route (URL path) গুলো এখানে define করা হয়
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public: anyone (including logged-out visitors) can browse jobs */}
          <Route path="/jobs" element={<JobListingsPage />} />

          {/* Any logged-in role */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Student-only pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['Student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['Student']}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute roles={['Student']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter-only pages */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute roles={['Recruiter']}>
                <RecruiterDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/postings/:jobPostingId/applicants"
            element={
              <ProtectedRoute roles={['Recruiter']}>
                <RecruiterApplicantsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin-only page */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['Admin']}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />

          {/* Public landing page */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
