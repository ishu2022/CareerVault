import { Search, Bell, ChevronDown } from "lucide-react";

// title/subtitle are optional. If a page doesn't pass them, we fall
// back to the dashboard's "Welcome back" greeting, so Dashboard.jsx
// doesn't need any changes.
export default function Navbar({ userName = "Ishika", title, subtitle }) {
  const heading = title || `Welcome back, ${userName}! 👋`;
  const subheading =
    subtitle || "Explore interview experiences and ace your next interview.";

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{subheading}</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for companies or questions..."
            className="w-80 pl-9 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        <button type="button" className="relative text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm">
            {userName.charAt(0)}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}