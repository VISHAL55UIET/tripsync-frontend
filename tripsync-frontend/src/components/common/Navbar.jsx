import { Link, useNavigate } from 'react-router-dom';
import { Compass, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 text-indigo-600 font-bold text-xl">
          <Compass className="w-7 h-7" />
          <span>TripSync</span>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/users"
              className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          <NotificationBell />

          <Link
            to="/profile"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline">{user?.fullName || 'Profile'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}