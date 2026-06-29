import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

// Maps notification type → accent color classes
const TYPE_COLORS = {
  first_login:            "bg-orange-100 text-orange-600",
  experience_submitted:   "bg-green-100 text-green-600",
  experience_deleted:     "bg-red-100 text-red-600",
  company_added:          "bg-blue-100 text-blue-600",
  general:                "bg-gray-100 text-gray-600",
};

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef(null);

  const {
    notifications,
    loading,
    unreadCount,
    markRead,
    markAllRead,
  } = useNotifications(userId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button ── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-gray-500 hover:text-gray-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium text-orange-500">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">
                  No new notifications.
                </p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                      notification.isRead
                        ? "bg-white hover:bg-gray-50"
                        : "bg-orange-50/40 hover:bg-orange-50"
                    }`}
                  >
                    {/* Type dot */}
                    <span
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        notification.isRead ? "bg-gray-200" : "bg-orange-400"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {!notification.isRead && (
                      <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}