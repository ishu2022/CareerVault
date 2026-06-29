import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import QuestionCard from "../components/QuestionCard";
import { useAppContext } from "../context/AppContext";
import { searchQuestions } from "../api/api";

const Questions = () => {
  const { searchQuery, setSearchQuery } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [results, setResults]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [hasSearched, setHasSearched]       = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(() => fetchResults(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchResults = useCallback(async (keyword) => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await searchQuestions(keyword);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const companyOptions = ["All", ...new Set(results.map((r) => r.company))];
  const filteredResults =
    selectedCompany === "All"
      ? results
      : results.filter((r) => r.company === selectedCompany);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-5 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Question Search</h1>
            <p className="text-gray-500 mt-1 text-sm">
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
              placeholder="Search questions by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         text-sm text-gray-700 bg-white shadow-sm"
            />
          </div>

          {/* Company filter */}
          {results.length > 0 && (
            <div className="flex items-center gap-2 mb-5 md:mb-6 flex-wrap">
              <span className="text-sm text-gray-500">Company:</span>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white"
              >
                {companyOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Results header */}
          {hasSearched && !loading && (
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">Results</h2>
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                  {filteredResults.length} Results Found
                </span>
              </div>
            </div>
          )}

          {loading && <p className="text-gray-500 text-sm">Searching questions...</p>}
          {!loading && error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && hasSearched && filteredResults.length === 0 && (
            <p className="text-gray-500 text-center mt-10">
              No questions found matching "{searchQuery}"
            </p>
          )}

          {!loading && !error && !hasSearched && (
            <p className="text-gray-400 text-center mt-10 text-sm">
              Start typing to search interview questions across all companies.
            </p>
          )}

          {!loading && !error && filteredResults.length > 0 && (
            <div className="space-y-3 md:space-y-4">
              {filteredResults.map((item, index) => (
                <QuestionCard
                  key={`${item.company}-${index}`}
                  company={item.company}
                  question={item.question}
                  roundType={item.round_type}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Questions;