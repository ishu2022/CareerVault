import React from "react";
import {
  BookOpen,
  BarChart2,
  FileText,
  Code2,
  Database,
  Monitor,
  Box,
  Users,
  ChevronDown,
  Target,
  Star,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OAStatCard from "../components/OAStatCard";
import TopicProgressBar from "../components/TopicProgressBar";
import TopQuestionItem from "../components/TopQuestionItem";
import PrepTipCard from "../components/PrepTipCard";
import { useAppContext } from "../context/AppContext";
import { getCompanyByName, getAllCompanyNames } from "../data/companies";
import { getTopicsForCompany } from "../data/topics";
import { getQuestionsByCompany } from "../data/questions";

const topicIconMap = {
  DSA: { icon: <Code2 size={16} className="text-orange-500" />, bg: "bg-orange-50" },
  DBMS: { icon: <Database size={16} className="text-indigo-500" />, bg: "bg-indigo-50" },
  OS: { icon: <Monitor size={16} className="text-blue-500" />, bg: "bg-blue-50" },
  OOP: { icon: <Box size={16} className="text-green-500" />, bg: "bg-green-50" },
  HR: { icon: <Users size={16} className="text-pink-500" />, bg: "bg-pink-50" },
  "System Design": { icon: <BarChart2 size={16} className="text-purple-500" />, bg: "bg-purple-50" },
};

const tips = [
  { title: "Focus on DSA", description: "45% of questions are from DSA. Practice trees, graphs, arrays and hashing.", icon: <Target size={22} className="text-orange-500" />, iconBg: "bg-orange-50" },
  { title: "Revise DBMS", description: "Focus on SQL queries, normalization and transactions.", icon: <Database size={22} className="text-indigo-500" />, iconBg: "bg-indigo-50" },
  { title: "Understand OS", description: "Know concepts of processes, threads, scheduling and deadlocks.", icon: <Monitor size={22} className="text-blue-500" />, iconBg: "bg-blue-50" },
  { title: "Practice Smart", description: "Solve previous year OAs and timed mock tests regularly.", icon: <Code2 size={22} className="text-green-500" />, iconBg: "bg-green-50" },
  { title: "Time Management", description: "Attempt easy questions first and manage time wisely.", icon: <Star size={22} className="text-yellow-500" />, iconBg: "bg-yellow-50" },
];

const OAPrep = () => {
  const { selectedCompany, setSelectedCompany } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const companyData = getCompanyByName(selectedCompany);
  const topics = getTopicsForCompany(selectedCompany);
  const questions = getQuestionsByCompany(selectedCompany);
  const companyNames = getAllCompanyNames();

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
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-md z-10 overflow-hidden">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <OAStatCard
              icon={<BookOpen size={20} className="text-orange-500" />}
              iconBg="bg-orange-50"
              title="Most Asked Topics"
              value={topics.length}
              subtitle="Key topics to focus"
            />
            <OAStatCard
              icon={<BarChart2 size={20} className="text-yellow-500" />}
              iconBg="bg-yellow-50"
              title="Difficulty"
              value={companyData?.difficultyLevel || "N/A"}
              subtitle="Based on past OA reports"
            />
            <OAStatCard
              icon={<FileText size={20} className="text-green-500" />}
              iconBg="bg-green-50"
              title="Total Questions"
              value={companyData?.totalQuestions || questions.length}
              subtitle="From past assessments"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                Most Asked Topics
              </h2>

              {topics.map((topic, index) => {
                const meta = topicIconMap[topic.label] || {
                  icon: <Code2 size={16} className="text-gray-500" />,
                  bg: "bg-gray-50",
                };
                return (
                  <TopicProgressBar
                    key={index}
                    icon={meta.icon}
                    iconBg={meta.bg}
                    label={topic.label}
                    percentage={topic.percentage}
                  />
                );
              })}

              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
                ⓘ Based on analysis of past {selectedCompany} OA papers
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                Top Questions
              </h2>

              {questions.length > 0 ? (
                questions.map((q, index) => (
                  <TopQuestionItem
                    key={q.id}
                    rank={index + 1}
                    question={q.question}
                    topic={q.topic}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  No questions available yet for {selectedCompany}.
                </p>
              )}

              <button className="w-full text-center text-sm font-medium text-orange-600 mt-2 hover:underline">
                View all questions →
              </button>
            </div>
          </div>

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