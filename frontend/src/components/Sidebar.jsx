import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Companies", icon: Building2, path: "/companies" },
  { label: "Question Search", icon: Search, path: "/questions" },
  { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { label: "Contribute", icon: CheckCircle2, path: "/contribute" },
  { label: "About Us", icon: Info, path: "/about" },
];

export default function Sidebar({ activeItem = "Dashboard" }) {
  const [dark, setDark] = useState(false);

  return (
    <aside className="w-64 min-h-screen bg-[#14141c] text-gray-300 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>

        <div>
          <p className="text-white font-bold leading-tight">
            CareerVault
          </p>
          <p className="text-[11px] text-gray-500">
            Interview Knowledge Explorer
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = label === activeItem;

          return (
            <Link
              key={label}
              to={path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-orange-500/15 text-orange-400 font-medium"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Contribute Card */}
      <div className="mx-4 mb-4 rounded-2xl bg-white/5 p-4">
        <Rocket className="w-6 h-6 text-orange-400 mb-3" />

        <p className="text-white text-sm font-semibold mb-1">
          Help others grow
        </p>

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
        <a
          href="#"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300"
        >
          <Package className="w-4 h-4" />
          Package
        </a>

        <a
          href="#"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300"
        >
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
  );
}