import { useMemo, useState } from "react";
import {
  Bookmark,
  Search,
  Bell,
  ChevronDown,
  ExternalLink,
  Trash2,
  BarChart3,
  PieChart,
  Rocket,
  ArrowRight,
  Command,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import CompanyMark from "../components/CompanyMark";

const FILTERS = ["All", "Amazon", "Google", "Microsoft", "Oracle", "TCS", "Adobe", "Salesforce"];

const DIFFICULTY_COLOR = {
  Easy: "#22C55E",
  Medium: "#FF9800",
  Hard: "#EF4444",
};

const BOOKMARKS = [
  {
    id: 1,
    company: "Amazon",
    mark: { bg: "#FFF3E0", fg: "#232F3E", letter: "a" },
    year: 2025,
    round: "Technical Round",
    question: "Explain HashMap internal working.",
    tags: ["Java", "DSA", "HashMap"],
    difficulty: "Medium",
  },
  {
    id: 2,
    company: "Google",
    mark: { bg: "#E8F0FE", fg: "#4285F4", letter: "G" },
    year: 2025,
    round: "Technical Round",
    question: "What is the difference between BFS and DFS?",
    tags: ["Algorithms", "Tree", "DFS"],
    difficulty: "Medium",
  },
  {
    id: 3,
    company: "Microsoft",
    mark: { bg: "#F1F8F4", fg: "#5B9BD5", letter: "M" },
    year: 2024,
    round: "Technical Round",
    question: "How does database indexing work?",
    tags: ["SQL", "DBMS", "Indexing"],
    difficulty: "Easy",
  },
  {
    id: 4,
    company: "Oracle",
    mark: { bg: "#FDECEC", fg: "#F80000", letter: "O" },
    year: 2024,
    round: "Technical Round",
    question: "Explain SQL JOINs with examples.",
    tags: ["SQL", "JOIN", "DBMS"],
    difficulty: "Medium",
  },
];

const TOPICS = [
  { label: "Data Structures & Algorithms", count: 12, color: "#FF9800" },
  { label: "SQL", count: 6, color: "#22C55E" },
  { label: "System Design", count: 4, color: "#3B82F6" },
  { label: "OOPs", count: 3, color: "#EC4899" },
  { label: "DBMS", count: 3, color: "#6366F1" },
];

export default function Bookmarks() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return BOOKMARKS.filter((b) => {
      const matchesFilter = activeFilter === "All" || b.company === activeFilter;
      const matchesQuery =
        query.trim() === "" ||
        b.question.toLowerCase().includes(query.toLowerCase()) ||
        b.company.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

return (
  <div className="min-h-screen bg-white flex">
    <Sidebar />

    <div className="flex-1">
        {/* Top bar */}
        <header className="flex items-center justify-between px-10 py-6">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-80 px-4 py-2.5 rounded-xl border border-[#EAEAEA] bg-white text-[#6B7280]">
              <Search className="w-4 h-4 shrink-0" />
              <input
                type="text"
                placeholder="Search companies or questions..."
                className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF] text-[#111827]"
              />
              <span className="flex items-center gap-0.5 text-[11px] text-[#9CA3AF] border border-[#EAEAEA] rounded-md px-1.5 py-0.5">
                <Command className="w-3 h-3" /> K
              </span>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="w-10 h-10 rounded-xl border border-[#EAEAEA] flex items-center justify-center text-[#6B7280] hover:bg-[#FAFAFA] transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-[#FAFAFA] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#FF9800] text-white text-sm font-semibold flex items-center justify-center">
                A
              </div>
              <ChevronDown className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </header>

        <div className="px-10 pb-12 grid grid-cols-[1fr_340px] gap-6">
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

            {/* Filter chips */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
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
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAEAEA] text-sm text-[#374151] hover:bg-[#FAFAFA] transition-colors">
                Latest
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#6B7280] mb-4">{filtered.length} Saved Questions</p>

            {/* Cards */}
            <div className="space-y-4">
              {filtered.map((b) => (
                <article
                  key={b.id}
                  className="relative rounded-2xl border border-[#EAEAEA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)] transition-shadow"
                >
                  <button
                    type="button"
                    aria-label="Bookmarked"
                    className="absolute top-5 right-5 text-[#FF9800]"
                  >
                    <Bookmark className="w-5 h-5 fill-[#FF9800]" />
                  </button>

                  <div className="flex gap-4">
                    <CompanyMark name={b.company} {...b.mark} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-[#111827]">{b.company}</span>
                        <span className="text-[#9CA3AF]">{b.year}</span>
                        <span className="w-1 h-1 rounded-full bg-[#FF9800]" />
                        <span className="text-[#6B7280]">{b.round}</span>
                      </div>
                      <h3 className="text-[17px] font-semibold text-[#111827] mt-2 pr-8">
                        {b.question}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {b.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F3F4F6] text-[#374151] border border-[#EAEAEA]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
                    <div className="flex items-center gap-1.5 text-sm text-[#374151]">
                      <span className="text-[#6B7280]">Difficulty:</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: DIFFICULTY_COLOR[b.difficulty] }}
                      />
                      <span className="font-medium">{b.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#EAEAEA] text-sm font-medium text-[#374151] hover:bg-[#FAFAFA] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Source
                      </button>
                      <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#FEE2E2] text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Bookmark
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {filtered.length === 0 && (
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
                <h3 className="font-semibold text-[#111827] text-[15px]">Bookmark Statistics</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox value="24" label="Saved Questions" />
                <StatBox value="12" label="Companies" />
                <StatBox value="18" label="Technical Questions" />
                <StatBox value="6" label="Behavioral Questions" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EAEAEA] p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-[18px] h-[18px] text-[#FF9800]" />
                <h3 className="font-semibold text-[#111827] text-[15px]">Most Saved Topics</h3>
              </div>
              <div className="space-y-3">
                {TOPICS.map((t) => (
                  <div key={t.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-[#374151] min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="truncate">{t.label}</span>
                    </span>
                    <span className="font-semibold text-[#111827] shrink-0 ml-2">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#FFF3E0] p-5">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4">
                <Rocket className="w-5 h-5 text-[#FF9800]" />
              </div>
              <h3 className="font-semibold text-[#111827] text-[15px] mb-1.5">Keep Learning</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                Explore more companies and discover valuable interview insights.
              </p>
              <button className="flex items-center justify-center gap-1.5 w-full bg-[#FF9800] hover:bg-[#FB8C00] transition-colors text-white text-sm font-semibold py-2.5 rounded-xl">
                Explore Companies
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
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
