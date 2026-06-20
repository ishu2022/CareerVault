import React from "react";
import { Search, ChevronDown } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import QuestionCard from "../components/QuestionCard";
import { useAppContext } from "../context/AppContext";
import { questions } from "../data/questions";

const TOPIC_OPTIONS = ["All", "DSA", "DBMS", "OS", "OOP", "React"];

const Questions = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedTopic,
    setSelectedTopic,
  } = useAppContext();

  const filteredQuestions = questions.filter((q) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      q.question.toLowerCase().includes(term) ||
      q.company.toLowerCase().includes(term) ||
      q.topic.toLowerCase().includes(term);
    const matchesTopic = selectedTopic === "All" || q.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Question Search
            </h1>
            <p className="text-gray-500 mt-1">
              Search interview questions across all companies
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search questions, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         text-sm text-gray-700 bg-white shadow-sm"
            />
          </div>

          {/* Topic filter chips */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {TOPIC_OPTIONS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  selectedTopic === topic
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Results</h2>
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                {filteredQuestions.length} Results Found
              </span>
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item) => (
                <QuestionCard
                  key={item.id}
                  id={item.id}
                  company={item.company}
                  question={item.question}
                  topic={item.topic}
                  year={item.year}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center mt-10">
                No questions found matching "{searchQuery}"
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Questions;