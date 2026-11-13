import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import TripWorkspaceLayout from './components/layout/TripWorkspaceLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import AcceptInvitePage from './pages/invitation/AcceptInvitePage';
import TripOverviewPage from './pages/trip-workspace/TripOverviewPage';
import TripItineraryPage from './pages/trip-workspace/TripItineraryPage';
import TripFinancePage from './pages/trip-workspace/TripFinancePage';
import TripDocumentsPage from './pages/trip-workspace/TripDocumentsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/trips/:tripId/invitations" element={<AcceptInvitePage />} />

        {/* Nested Trip Workspace */}
        <Route path="/trips/:tripId" element={<TripWorkspaceLayout />}>
          <Route index element={<TripOverviewPage />} />
          <Route path="itinerary" element={<TripItineraryPage />} />
          <Route path="finance" element={<TripFinancePage />} />
          <Route path="documents" element={<TripDocumentsPage />} />
        </Route>

        {/* Admin Only Route */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}