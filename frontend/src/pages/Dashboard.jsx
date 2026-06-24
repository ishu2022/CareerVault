import { useEffect, useState } from "react";
import { Building2, Users, HelpCircle, TrendingUp, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import CompanyCard from "../components/CompanyCard";
import InterviewTrendChart from "../components/InterviewTrendChart";
import PopularTopics from "../components/PopularTopics";
import { getStats, getPopularTopics } from "../api/api";

const statConfig = [
  { key: "total_companies", icon: Building2, iconBg: "bg-orange-50", iconColor: "text-orange-500", label: "Companies", subtitle: "Total Companies" },
  { key: "total_interviews", icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-500", label: "Interviews", subtitle: "Total Interviews" },
  { key: "total_questions", icon: HelpCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Questions", subtitle: "Total Questions" },
  { key: "total_rounds", icon: TrendingUp, iconBg: "bg-purple-50", iconColor: "text-purple-500", label: "Interview Rounds", subtitle: "Total Rounds Recorded" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [topicsData, setTopicsData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStats();
        setStatsData(data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTopics = async () => {
      try {
        const data = await getPopularTopics();
        setTopicsData(data);
      } catch (err) {
        // non-critical — page still works without this section
      }
    };

    fetchStats();
    fetchTopics();
  }, []);

  // Derived from real data — top 5 companies by interview count
  const topCompanies = (statsData?.by_company || []).slice(0, 5);

  // Derived from real data — chronological year-wise trend
  const trendData = (statsData?.by_year || [])
    .slice()
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((y) => ({ label: y.year, value: y.count }));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar userName="Sakshi" />

        <main className="p-8 space-y-6">
          {loading && (
            <p className="text-gray-500 text-sm">Loading dashboard...</p>
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && !error && statsData && (
            <>
              {/* Stats row */}
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

              {/* Top Companies + Interview Trend */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Top Companies</h3>
                      <p className="text-xs text-gray-400">
                        Companies with the most interview experiences shared
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/companies")}
                      className="text-orange-500 text-sm font-medium hover:underline"
                    >
                      View all →
                    </button>
                  </div>

                  {topCompanies.length > 0 ? (
                    <div className="grid grid-cols-5 gap-4">
                      {topCompanies.map((c) => (
                        <CompanyCard
                          key={c.company}
                          name={c.company}
                          interviews={c.count}
                          logo={
                            <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
                              {c.company.charAt(0).toUpperCase()}
                            </div>
                          }
                          onViewDetails={() => navigate(`/companies/${c.company}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No company data available.</p>
                  )}
                </div>

                <div className="col-span-1">
                  {trendData.length > 0 ? (
                    <InterviewTrendChart data={trendData} />
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full flex items-center justify-center">
                      <p className="text-sm text-gray-400">No trend data available.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Topics — derived from keyword analysis on real question text */}
              {topicsData.length > 0 && (
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-3">
                    <PopularTopics
                      topics={topicsData.map((t) => ({
                        name: t.name,
                        count: t.count.toString(),
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* CTA banner — static UI element, not data-driven */}
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
                  onClick={() => navigate("/questions")}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 whitespace-nowrap"
                >
                  Start Exploring <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}