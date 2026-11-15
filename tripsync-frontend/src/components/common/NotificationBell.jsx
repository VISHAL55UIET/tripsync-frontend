import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  MailPlus,
  Send,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workspaceApi } from '../../api/workspaceApi';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.max(1, Math.floor((now - past) / 1000));

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString();
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await workspaceApi.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s polling
    const handleInstantRefresh = () => fetchNotifications();
    window.addEventListener('notifications:refresh', handleInstantRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:refresh', handleInstantRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        const updated = await workspaceApi.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? updated || { ...item, read: true } : item))
        );
      }
      if (notif.tripId) {
        setOpen(false);
        if (notif.type === 'INVITATION_RECEIVED') {
          navigate(`/trips/${notif.tripId}/invitations`);
        } else {
          navigate(`/trips/${notif.tripId}`);
        }
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => workspaceApi.markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INVITATION_RECEIVED':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <MailPlus className="w-4 h-4" />
          </div>
        );
      case 'INVITATION_SENT':
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
        );
      case 'INVITATION_ACCEPTED':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      case 'INVITATION_REJECTED':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-rose-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[92vw] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-7 h-7 text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trip invites and member updates will appear here
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 cursor-pointer hover:bg-slate-800/70 transition flex items-start gap-3 ${
                    !n.read ? 'bg-rose-500/10 border-l-2 border-l-rose-500' : ''
                  }`}
                >
                  {getTypeIcon(n.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 truncate">
                        <span className="truncate">{n.title}</span>
                        {n.tripId && (
                          <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0" />
                        )}
                      </p>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>

                    {!n.read && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        New Invite • Click to review
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <span
                      title="Unread"
                      className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1.5"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}