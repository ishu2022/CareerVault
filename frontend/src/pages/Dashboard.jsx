import { useEffect, useState } from "react";
import { Building2, Users, HelpCircle, TrendingUp, Trophy, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import CompanyCard from "../components/CompanyCard";
import InterviewTrendChart from "../components/InterviewTrendChart";
import RecentInterviews from "../components/RecentInterviews";
import PopularTopics from "../components/PopularTopics";
import { getStats } from "../api/api";

const statConfig = [
  { key: "total_companies", icon: Building2, iconBg: "bg-orange-50", iconColor: "text-orange-500", label: "Companies", subtitle: "Total Companies" },
  { key: "total_interviews", icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-500", label: "Interviews", subtitle: "Total Interviews" },
  { key: "total_questions", icon: HelpCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Questions", subtitle: "Total Questions" },
  { key: "total_rounds", icon: TrendingUp, iconBg: "bg-purple-50", iconColor: "text-purple-500", label: "Interview Rounds", subtitle: "Total Rounds Recorded" },
];

const companies = [
  {
    name: "Amazon",
    interviews: 156,
    logo: <div className="w-7 h-7 rounded-md bg-gray-900 text-white flex items-center justify-center text-sm font-bold">a</div>,
  },
  {
    name: "Google",
    interviews: 142,
    logo: <div className="w-7 h-7 rounded-md bg-white border border-gray-200 text-blue-500 flex items-center justify-center text-sm font-bold">G</div>,
  },
  {
    name: "Microsoft",
    interviews: 98,
    logo: (
      <div className="w-7 h-7 rounded-md bg-white border border-gray-200 grid grid-cols-2 gap-0.5 p-1">
        <span className="bg-red-500" />
        <span className="bg-emerald-500" />
        <span className="bg-blue-500" />
        <span className="bg-amber-400" />
      </div>
    ),
  },
  {
    name: "Oracle",
    interviews: 85,
    logo: <div className="w-7 h-7 rounded-md bg-red-600 text-white flex items-center justify-center text-sm font-bold">O</div>,
  },
  {
    name: "Deutsche Bank",
    interviews: 68,
    logo: <div className="w-7 h-7 rounded-md bg-blue-900 text-white flex items-center justify-center text-xs font-bold">DB</div>,
  },
];

const trendData = [
  { label: "Dec '24", value: 70 },
  { label: "Jan '25", value: 90 },
  { label: "Feb '25", value: 110 },
  { label: "Mar '25", value: 128 },
  { label: "Apr '25", value: 150 },
  { label: "May '25", value: 175 },
];

const recentInterviews = [
  { company: "Amazon", role: "SDE Intern Interview", year: "2025", timeAgo: "2 hours ago", initial: "a", logoBg: "bg-gray-900", logoText: "text-white" },
  { company: "Google", role: "Software Engineer Interview", year: "2025", timeAgo: "5 hours ago", initial: "G", logoBg: "bg-white border border-gray-200", logoText: "text-blue-500" },
  { company: "Microsoft", role: "Product Manager Interview", year: "2025", timeAgo: "1 day ago", initial: "M", logoBg: "bg-white border border-gray-200", logoText: "text-emerald-500" },
  { company: "Oracle", role: "Developer Interview", year: "2025", timeAgo: "2 days ago", initial: "O", logoBg: "bg-red-600", logoText: "text-white" },
];

const popularTopics = [
  { name: "Data Structures", count: "1.2K" },
  { name: "Algorithms", count: "1.1K" },
  { name: "System Design", count: "986" },
  { name: "SQL", count: "742" },
  { name: "Operating Systems", count: "612" },
  { name: "DBMS", count: "509" },
  { name: "OOPs", count: "487" },
  { name: "Networking", count: "421" },
  { name: "Java", count: "398" },
  { name: "Python", count: "356" },
];

export default function Dashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStats();
        setStatsData(data);
      } catch (err) {
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar userName="Sakshi" />

        <main className="p-8 space-y-6">
          {/* Stats row */}
          {loading && <p className="text-gray-500 text-sm">Loading stats...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!loading && !error && statsData && (
            <div className="grid grid-cols-4 gap-5">
              {statConfig.map((s) => (
                <StatsCard
                  key={s.key}
                  icon={s.icon}
                  iconBg={s.iconBg}
                  iconColor={s.iconColor}
                  label={s.label}
                  value={statsData[s.key]}
                  subtitle={s.subtitle}
                />
              ))}
            </div>
          )}

          {/* Top Companies + Interview Trend */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Top Companies</h3>
                  <p className="text-xs text-gray-400">Explore interview experiences from top companies</p>
                </div>
                <button type="button" className="text-orange-500 text-sm font-medium hover:underline">
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {companies.map((c) => (
                  <CompanyCard key={c.name} {...c} />
                ))}
              </div>
            </div>

            <div className="col-span-1">
              <InterviewTrendChart data={trendData} />
            </div>
          </div>

          {/* Recently Added Interviews + Popular Topics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <RecentInterviews items={recentInterviews} />
            </div>
            <div className="col-span-1">
              <PopularTopics topics={popularTopics} />
            </div>
          </div>

          {/* CTA banner */}
          <div className="bg-amber-50 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Ace Your Next Interview</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Practice, prepare and succeed with real interview questions shared by top candidates.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 whitespace-nowrap"
            >
              Start Exploring <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}