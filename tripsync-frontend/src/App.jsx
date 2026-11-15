import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import TripWorkspaceLayout from './components/layout/TripWorkspaceLayout';
import Footer from './components/common/Footer';
import TripMemoriesPage from './pages/trip-workspace/TripMemoriesPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import AcceptInvitePage from './pages/invitation/AcceptInvitationPage';
import TripOverviewPage from './pages/trip-workspace/TripOverviewPage';
import TripItineraryPage from './pages/trip-workspace/TripItineraryPage';
import TripFinancePage from './pages/trip-workspace/TripFinancePage';
import TripDocumentsPage from './pages/trip-workspace/TripDocumentsPage';
import TripAiGuidePage from './pages/trip-workspace/TripAiGuidePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/trips" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            

            {/* Both email link (/invitations/accept) and notification link (/trips/:tripId/invitations) */}
            <Route path="/invitations/accept" element={<AcceptInvitePage />} />
            <Route path="/trips/:tripId/invitations" element={<AcceptInvitePage />} />

            <Route path="/trips/:tripId" element={<TripWorkspaceLayout />}>
               <Route path="memories" element={<TripMemoriesPage />} />
              <Route index element={<TripOverviewPage />} />
              <Route path="itinerary" element={<TripItineraryPage />} />
              <Route path="finance" element={<TripFinancePage />} />
              <Route path="documents" element={<TripDocumentsPage />} />
              <Route path="ai-guide" element={<TripAiGuidePage />} />
            </Route>

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}