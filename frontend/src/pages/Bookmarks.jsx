import { useMemo, useState } from "react";
import {
  Bookmark,
  Search,
  ChevronDown,
  ExternalLink,
  Trash2,
  BarChart3,
  PieChart,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CompanyMark from "../components/CompanyMark";
import { useAppContext } from "../context/AppContext";

export default function Bookmarks() {
  const { bookmarks, toggleBookmark } = useAppContext();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  // Build company filter chips dynamically from actual bookmarked companies
  const companyFilters = useMemo(() => {
    const unique = [...new Set(bookmarks.map((b) => b.company))];
    return ["All", ...unique];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesFilter = activeFilter === "All" || b.company === activeFilter;
      const matchesQuery =
        query.trim() === "" ||
        b.question.toLowerCase().includes(query.toLowerCase()) ||
        b.company.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [bookmarks, activeFilter, query]);

  // Stats derived from real bookmark data only
  const totalSaved = bookmarks.length;
  const totalCompanies = new Set(bookmarks.map((b) => b.company)).size;
  const technicalCount = bookmarks.filter((b) => b.round_type === "technical").length;
  const hrCount = bookmarks.filter((b) => b.round_type === "hr").length;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="px-10 py-6 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[#FF9800]" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111827] leading-tight">Bookmarks</h1>
              <p className="text-[#6B7280] text-sm mt-0.5">
                Save important interview questions and revisit them anytime.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_340px] gap-6">
            {/* Main column */}
            <main className="min-w-0">
              {/* Search saved */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#EAEAEA] bg-white mb-4">
                <Search className="w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your saved questions..."
                  className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF] text-[#111827]"
                />
              </div>

              {/* Filter chips — built from real bookmarked companies */}
              {bookmarks.length > 0 && (
                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {companyFilters.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          activeFilter === f
                            ? "bg-[#FFF3E0] border-[#FF9800] text-[#FF9800]"
                            : "bg-white border-[#EAEAEA] text-[#6B7280] hover:border-[#FFB74D] hover:text-[#FF9800]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bookmarks.length > 0 && (
                <p className="text-sm text-[#6B7280] mb-4">
                  {filtered.length} Saved Questions
                </p>
              )}

              {/* Cards */}
              <div className="space-y-4">
                {filtered.map((b, index) => (
                  <article
                    key={`${b.company}-${index}`}
                    className="relative rounded-2xl border border-[#EAEAEA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)] transition-shadow"
                  >
                    <button
                      type="button"
                      aria-label="Remove bookmark"
                      onClick={() => toggleBookmark(b)}
                      className="absolute top-5 right-5 text-[#FF9800]"
                    >
                      <Bookmark className="w-5 h-5 fill-[#FF9800]" />
                    </button>

                    <div className="flex gap-4">
                      <CompanyMark name={b.company} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-[#111827]">{b.company}</span>
                          {b.round_type && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-[#FF9800]" />
                              <span className="text-[#6B7280] capitalize">
                                {b.round_type} Round
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-[17px] font-semibold text-[#111827] mt-2 pr-8">
                          {b.question}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#F3F4F6]">
                      <button
                        onClick={() => toggleBookmark(b)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#FEE2E2] text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Bookmark
                      </button>
                    </div>
                  </article>
                ))}

                {bookmarks.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-[#EAEAEA] rounded-2xl">
                    <Bookmark size={36} className="text-[#D1D5DB] mx-auto mb-3" />
                    <p className="text-[#6B7280] text-sm mb-4">
                      You haven't bookmarked any questions yet.
                    </p>
                    <button
                      onClick={() => navigate("/questions")}
                      className="text-sm font-medium text-[#FF9800] border border-[#FFB74D] rounded-lg px-4 py-2 hover:bg-[#FFF3E0] transition-colors"
                    >
                      Browse Questions →
                    </button>
                  </div>
                )}

                {bookmarks.length > 0 && filtered.length === 0 && (
                  <div className="text-center py-16 text-[#6B7280] text-sm border border-dashed border-[#EAEAEA] rounded-2xl">
                    No saved questions match this filter yet.
                  </div>
                )}
              </div>
            </main>

            {/* Right sidebar */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-[#EAEAEA] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-[18px] h-[18px] text-[#FF9800]" />
                  <h3 className="font-semibold text-[#111827] text-[15px]">
                    Bookmark Statistics
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox value={totalSaved} label="Saved Questions" />
                  <StatBox value={totalCompanies} label="Companies" />
                  <StatBox value={technicalCount} label="Technical Questions" />
                  <StatBox value={hrCount} label="HR Questions" />
                </div>
              </div>

              <div className="rounded-2xl bg-[#FFF3E0] p-5">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4">
                  <Rocket className="w-5 h-5 text-[#FF9800]" />
                </div>
                <h3 className="font-semibold text-[#111827] text-[15px] mb-1.5">
                  Keep Learning
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                  Explore more companies and discover valuable interview insights.
                </p>
                <button
                  onClick={() => navigate("/companies")}
                  className="flex items-center justify-center gap-1.5 w-full bg-[#FF9800] hover:bg-[#FB8C00] transition-colors text-white text-sm font-semibold py-2.5 rounded-xl"
                >
                  Explore Companies
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="rounded-xl border border-[#EAEAEA] px-3 py-3.5 text-center">
      <p className="text-2xl font-bold text-[#111827]">{value}</p>
      <p className="text-xs text-[#6B7280] mt-1 leading-tight">{label}</p>
    </div>
  );
}