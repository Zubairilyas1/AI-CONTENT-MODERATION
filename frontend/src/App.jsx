import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Submit from './pages/Submit';
import AppealForm from './pages/AppealForm';
import AdminAppeals from './pages/AdminAppeals';
import AdminPolicies from './pages/AdminPolicies';
import AdminAnalytics from './pages/AdminAnalytics';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit"
        element={
          <ProtectedRoute>
            <Submit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appeal/:submissionId"
        element={
          <ProtectedRoute>
            <AppealForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/appeals"
        element={
          <ProtectedRoute adminOnly>
            <AdminAppeals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/policies"
        element={
          <ProtectedRoute adminOnly>
            <AdminPolicies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute adminOnly>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
