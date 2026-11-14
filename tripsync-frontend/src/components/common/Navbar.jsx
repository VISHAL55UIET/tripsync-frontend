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
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 text-white font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight">TripSync</span>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/users"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl transition"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          <NotificationBell />

          <Link
            to="/profile"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline">{user?.fullName || 'Profile'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}