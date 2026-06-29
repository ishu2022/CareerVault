import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Package,
  Home,
  Building2,
  Search,
  Bookmark,
  CheckCircle2,
  Info,
  MessageSquare,
  Sun,
  Moon,
  Rocket,
  FileText,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",       icon: Home,         path: "/dashboard" },
  { label: "Companies",       icon: Building2,    path: "/companies" },
  { label: "Question Search", icon: Search,       path: "/questions" },
  { label: "OA Prep",         icon: FileText,     path: "/oa-prep" },
  { label: "Bookmarks",       icon: Bookmark,     path: "/bookmarks" },
  { label: "Contribute",      icon: CheckCircle2, path: "/contribute" },
  { label: "About Us",        icon: Info,         path: "/about" },
];

export default function Sidebar({ activeItem = "Dashboard", mobileOpen = false, onMobileClose }) {
  const [dark, setDark] = useState(false);

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-[#14141c] text-gray-300 flex flex-col
          transition-transform duration-300 ease-in-out
          w-64
          lg:static lg:translate-x-0 lg:shrink-0 lg:min-h-screen
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold leading-tight">CareerVault</p>
              <p className="text-[11px] text-gray-500">Interview Knowledge Explorer</p>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden text-gray-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-orange-500/15 text-orange-400 font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Contribute Card */}
        <div className="mx-4 mb-4 rounded-2xl bg-white/5 p-4">
          <Rocket className="w-6 h-6 text-orange-400 mb-3" />
          <p className="text-white text-sm font-semibold mb-1">Help others grow</p>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Share your interview experience and help the community.
          </p>
          <button
            type="button"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg py-2 transition-colors"
          >
            Contribute Now
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-4 space-y-3">
          <a href="#" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300">
            <Package className="w-4 h-4" />
            Package
          </a>
          <a href="#" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </a>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-center gap-3 px-6 py-4">
          <Sun className="w-4 h-4 text-gray-500" />
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              dark ? "bg-gray-700" : "bg-orange-500"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                dark ? "left-5" : "left-0.5"
              }`}
            />
          </button>
          <Moon className="w-4 h-4 text-gray-500" />
        </div>
      </aside>
    </>
  );
}