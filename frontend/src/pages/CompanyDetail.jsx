import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Bookmark,
  FileText,
  MessageSquare,
  Users,
  Info,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import InterviewCard from "../components/InterviewCard";
import InterviewSummaryWidget from "../components/InterviewSummaryWidget";
import YearWiseInterviews from "../components/YearWiseInterviews";
import MostCommonRounds from "../components/MostCommonRounds";
import { getCompanyByName } from "../data/companies";

const tabs = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "interviews", label: "Interviews", icon: FileText, count: "interviews" },
  { key: "questions", label: "Questions", icon: MessageSquare, count: "questions" },
  { key: "contributors", label: "Contributors", icon: Users, count: "contributors" },
  { key: "info", label: "Company Info", icon: Info },
];

const CompanyDetail = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const company = getCompanyByName(companyName);

  if (!company) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <p className="text-gray-500">
              No data available for "{companyName}" yet.
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <button
            onClick={() => navigate("/companies")}
            className="flex items-center gap-2 text-sm text-orange-600 font-medium mb-5 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Companies
          </button>

          {/* Header card */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6 flex items-start justify-between">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-gray-900">
                  {company.initial}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {company.name}
                  </h1>
                  {company.featured && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-50 text-orange-500 rounded-full font-medium">
                      <Star size={12} className="fill-orange-500" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  {company.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {company.totalInterviews}
                      </p>
                      <p className="text-xs text-gray-400">Interviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {company.totalQuestions}
                      </p>
                      <p className="text-xs text-gray-400">Questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {company.avgRating}
                      </p>
                      <p className="text-xs text-gray-400">Avg Rating</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {company.contributors}
                      </p>
                      <p className="text-xs text-gray-400">Contributors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg px-4 py-2 hover:bg-orange-50 transition-colors">
              <Bookmark size={14} />
              Bookmark
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const countValue =
                tab.count === "interviews"
                  ? company.totalInterviews
                  : tab.count === "questions"
                  ? company.totalQuestions
                  : tab.count === "contributors"
                  ? company.contributorsCount
                  : null;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {countValue !== null && (
                    <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      {countValue}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base">
                      Interview Experiences
                    </h2>
                    <p className="text-xs text-gray-400">
                      Real interview experiences shared by the community
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600">
                      <option>All Years</option>
                      {company.yearWiseInterviews.map((y) => (
                        <option key={y.year}>{y.year}</option>
                      ))}
                    </select>
                    <button className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      Add Experience
                    </button>
                  </div>
                </div>

                <div>
                  {company.interviews.length > 0 ? (
                    company.interviews.map((interview, index) => (
                      <InterviewCard key={index} {...interview} />
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 py-6 text-center">
                      No interview experiences recorded yet for {company.name}.
                    </p>
                  )}
                </div>

                {company.interviews.length > 0 && (
                  <button className="w-full mt-4 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg py-2.5 hover:bg-orange-50 transition-colors">
                    View All {company.totalInterviews} Interviews →
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <InterviewSummaryWidget
                totalInterviews={company.totalInterviews}
                avgRating={company.avgRating}
                avgProcessTime={company.avgProcessTime}
                difficultyLevel={company.difficultyLevel}
              />
              {company.yearWiseInterviews.length > 0 && (
                <YearWiseInterviews data={company.yearWiseInterviews} />
              )}
              {company.commonRounds.length > 0 && (
                <MostCommonRounds data={company.commonRounds} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyDetail;