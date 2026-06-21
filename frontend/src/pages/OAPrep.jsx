import React, { useState, useEffect } from "react";
import {
  BookOpen,
  BarChart2,
  FileText,
  Code2,
  Users,
  ChevronDown,
  Target,
  Database,
  Monitor,
  Star,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OAStatCard from "../components/OAStatCard";
import TopicProgressBar from "../components/TopicProgressBar";
import TopQuestionItem from "../components/TopQuestionItem";
import PrepTipCard from "../components/PrepTipCard";
import { useAppContext } from "../context/AppContext";
import { getCompanies, getCompany } from "../api/api";

const tips = [
  { title: "Focus on Fundamentals", description: "Most rounds are technical — revise core CS concepts thoroughly.", icon: <Target size={22} className="text-orange-500" />, iconBg: "bg-orange-50" },
  { title: "Practice Coding", description: "Solve previous year questions from this company's interview history.", icon: <Code2 size={22} className="text-green-500" />, iconBg: "bg-green-50" },
  { title: "Know Your Resume", description: "Many rounds ask about projects and past experience in depth.", icon: <FileText size={22} className="text-blue-500" />, iconBg: "bg-blue-50" },
  { title: "Prepare for HR", description: "HR rounds often include behavioral and motivational questions.", icon: <Users size={22} className="text-pink-500" />, iconBg: "bg-pink-50" },
  { title: "Stay Calm", description: "Take your time on coding questions — clarity matters more than speed.", icon: <Star size={22} className="text-yellow-500" />, iconBg: "bg-yellow-50" },
];

const OAPrep = () => {
  const { selectedCompany, setSelectedCompany } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [companyNames, setCompanyNames] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch full company list once, for the dropdown
  useEffect(() => {
    const fetchNames = async () => {
      try {
        const data = await getCompanies();
        setCompanyNames(data);
      } catch (err) {
        // dropdown just stays empty if this fails — non-critical
      }
    };
    fetchNames();
  }, []);

  // Fetch selected company's experiences whenever selection changes
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCompany(selectedCompany);
        setCompanyData(data);
      } catch (err) {
        setError("Failed to load preparation data for this company.");
        setCompanyData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [selectedCompany]);

  // ---- Derive everything from real experiences[] ----
  const experiences = companyData?.experiences || [];

  const allRounds = experiences.flatMap((exp) => exp.rounds || []);
  const totalQuestions = allRounds.reduce(
    (sum, r) => sum + (r.questions?.length || 0),
    0
  );

  const technicalCount = allRounds.filter((r) => r.round_type === "technical")
    .reduce((sum, r) => sum + (r.questions?.length || 0), 0);
  const hrCount = allRounds.filter((r) => r.round_type === "hr")
    .reduce((sum, r) => sum + (r.questions?.length || 0), 0);
  const otherCount = totalQuestions - technicalCount - hrCount;

  const roundBreakdown = totalQuestions > 0
    ? [
        { label: "Technical", percentage: Math.round((technicalCount / totalQuestions) * 100) },
        { label: "HR", percentage: Math.round((hrCount / totalQuestions) * 100) },
        ...(otherCount > 0
          ? [{ label: "Other", percentage: Math.round((otherCount / totalQuestions) * 100) }]
          : []),
      ]
    : [];

  // Most common difficulty across experiences
  const difficultyCounts = experiences.reduce((acc, exp) => {
    if (exp.difficulty) acc[exp.difficulty] = (acc[exp.difficulty] || 0) + 1;
    return acc;
  }, {});
  const mostCommonDifficulty =
    Object.entries(difficultyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Top 5 real extracted questions (first non-empty ones found)
  const topQuestions = allRounds
    .flatMap((r) => r.questions || [])
    .filter((q) => q.trim())
    .slice(0, 5);

  const roundIconMap = {
    Technical: { icon: <Code2 size={16} className="text-orange-500" />, bg: "bg-orange-50" },
    HR: { icon: <Users size={16} className="text-pink-500" />, bg: "bg-pink-50" },
    Other: { icon: <Monitor size={16} className="text-gray-500" />, bg: "bg-gray-50" },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tomorrow OA Mode
              </h1>
              <p className="text-gray-500 mt-1">
                Prepare for your online assessment with company-specific insights
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-700">
                  {selectedCompany.charAt(0)}
                </span>
                <span className="font-medium text-gray-800 text-sm">
                  {selectedCompany}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-md z-10 overflow-hidden max-h-72 overflow-y-auto">
                  {companyNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedCompany(name);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${
                        selectedCompany === name
                          ? "text-orange-600 font-medium bg-orange-50"
                          : "text-gray-700"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-gray-500 text-sm">Loading preparation data...</p>
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && !error && experiences.length === 0 && (
            <p className="text-gray-500 text-sm">
              No interview data available yet for {selectedCompany}.
            </p>
          )}

          {!loading && !error && experiences.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <OAStatCard
                  icon={<BookOpen size={20} className="text-orange-500" />}
                  iconBg="bg-orange-50"
                  title="Total Experiences"
                  value={experiences.length}
                  subtitle="Shared interview reports"
                />
                <OAStatCard
                  icon={<BarChart2 size={20} className="text-yellow-500" />}
                  iconBg="bg-yellow-50"
                  title="Common Difficulty"
                  value={mostCommonDifficulty}
                  subtitle="Most reported difficulty"
                />
                <OAStatCard
                  icon={<FileText size={20} className="text-green-500" />}
                  iconBg="bg-green-50"
                  title="Total Questions"
                  value={totalQuestions}
                  subtitle="Extracted from experiences"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 text-lg mb-5">
                    Round Type Breakdown
                  </h2>

                  {roundBreakdown.length > 0 ? (
                    roundBreakdown.map((round, index) => {
                      const meta = roundIconMap[round.label] || roundIconMap.Other;
                      return (
                        <TopicProgressBar
                          key={index}
                          icon={meta.icon}
                          iconBg={meta.bg}
                          label={round.label}
                          percentage={round.percentage}
                        />
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-400">No question data available.</p>
                  )}

                  <p className="text-xs text-gray-400 mt-4">
                    ⓘ Based on {experiences.length} shared experiences for {selectedCompany}
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 text-lg mb-5">
                    Sample Questions
                  </h2>

                  {topQuestions.length > 0 ? (
                    topQuestions.map((q, index) => (
                      <TopQuestionItem
                        key={index}
                        rank={index + 1}
                        question={q}
                        topic=""
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No questions extracted yet for {selectedCompany}.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-bold text-gray-900 text-lg mb-6">
              Quick Preparation Tips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {tips.map((tip, index) => (
                <PrepTipCard
                  key={index}
                  icon={tip.icon}
                  iconBg={tip.iconBg}
                  title={tip.title}
                  description={tip.description}
                />
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center">
            <p className="text-gray-700 text-sm italic">
              <span className="text-orange-400 font-bold text-lg mr-1">"</span>
              Consistent practice today leads to a better opportunity tomorrow.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OAPrep;