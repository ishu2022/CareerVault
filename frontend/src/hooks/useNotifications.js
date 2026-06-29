import { useState, useEffect, useCallback } from "react";

const BASE = "/api/v1";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${BASE}/notifications?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
      setNotifications(data);
    } catch (err) {
      console.error("[useNotifications] fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Mark one read ────────────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      const res = await fetch(`${BASE}/notifications/${id}/read`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as read");
      }
    } catch (err) {
      console.error("[useNotifications] markRead error:", err);
      // Roll back optimistic update
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // ── Mark all read ────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const res = await fetch(`${BASE}/notifications/read-all`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark all as read");
      }
    } catch (err) {
      console.error("[useNotifications] markAllRead error:", err);
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, loading, error, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}