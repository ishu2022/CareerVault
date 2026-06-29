// src/components/Toast.jsx
//
// Minimal, self-contained toast notification.
// No new dependencies. Auto-dismisses after `duration` ms.
// Designed to be unobtrusive and not alter any existing layout.

import { useEffect } from "react";

export default function Toast({ message, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-xs">
        {message}
      </div>
    </div>
  );
}