import { Search } from "lucide-react";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resolveGlobalSearch } from "../utils/searchUtils";
import Toast from "./Toast";
import NotificationBell from "./NotificationBell";

export default function Navbar({ title, subtitle, onMobileMenuOpen }) {
  const { userName, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchValue, setSearchValue]   = useState("");
  const [isSearching, setIsSearching]   = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const heading    = title    || `Welcome back, ${userName}! 👋`;
  const subheading = subtitle || "Explore interview experiences and ace your next interview.";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSearch = async () => {
    const trimmed = searchValue.trim();

    if (!trimmed) {
      setToastMessage("Please enter a search term.");
      return;
    }

    if (isSearching) return;

    setIsSearching(true);

    try {
      const result = await resolveGlobalSearch(trimmed);

      if (!result) {
        setToastMessage("Please enter a search term.");
        return;
      }

      if (!result.matchedCompany) {
        setToastMessage("No matching company found. Showing question search results.");
      }

      navigate(result.path);
    } catch (err) {
      console.error("Global search failed:", err);
      setToastMessage("No results found.");
      navigate(`/questions?q=${encodeURIComponent(trimmed)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-white border-b border-gray-100 gap-3">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onMobileMenuOpen}
        className="lg:hidden text-gray-500 hover:text-gray-700 shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Title — hidden on mobile to save space */}
      <div className="hidden md:block shrink-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{heading}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{subheading}</p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Search bar */}
        <div className="relative">
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="w-36 sm:w-52 lg:w-80 pl-9 pr-3 lg:pr-12 py-2 lg:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <kbd className="hidden lg:block absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        <NotificationBell userId={currentUser?.uid} />

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 cursor-pointer"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-md z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
}