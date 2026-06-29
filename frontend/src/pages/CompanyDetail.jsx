import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Layers, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getCompany, deleteExperience } from "../api/api";

const difficultyStyles = {
  easy:   "bg-green-50 text-green-600",
  medium: "bg-yellow-50 text-yellow-600",
  hard:   "bg-red-50 text-red-600",
};

const outcomeStyles = {
  selected: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
  unknown:  "bg-gray-100 text-gray-500",
};

const CompanyDetail = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCompany(companyName);
        setCompanyData(data);
      } catch (err) {
        setError("Failed to load company details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyName]);

  const handleDelete = async (experienceId) => {
    if (!window.confirm("Are you sure you want to delete this experience? This cannot be undone.")) return;

    try {
      setDeletingId(experienceId);
      await deleteExperience(experienceId);
      setCompanyData((prev) => ({
        ...prev,
        experiences: prev.experiences.filter((exp) => exp.id !== experienceId),
      }));
    } catch (err) {
      alert("Failed to delete experience. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const sharedLayout = (children) => (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );

  if (loading) return sharedLayout(<p className="text-gray-500 text-sm">Loading company details...</p>);
  if (error)   return sharedLayout(<p className="text-red-500 text-sm">{error}</p>);
  if (!companyData?.experiences) return sharedLayout(
    <p className="text-gray-500">No data available for "{companyName}" yet.</p>
  );

  const { company, experiences } = companyData;

  const totalInterviews = experiences.length;
  const totalQuestions  = experiences.reduce(
    (sum, exp) => sum + exp.rounds.reduce((rSum, r) => rSum + r.questions.length, 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">
          <button
            onClick={() => navigate("/companies")}
            className="flex items-center gap-2 text-sm text-orange-600 font-medium mb-5 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Companies
          </button>

          {/* Header card — stacks on mobile */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm mb-5 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
              <span className="text-2xl md:text-4xl font-bold text-gray-900">
                {company.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 break-words">
                {company}
              </h1>

              <div className="flex gap-6 md:gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{totalInterviews}</p>
                    <p className="text-xs text-gray-400">Interviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{totalQuestions}</p>
                    <p className="text-xs text-gray-400">Questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experiences list */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-base mb-1">Interview Experiences</h2>
            <p className="text-xs text-gray-400 mb-5">Real interview experiences shared by the community</p>

            {experiences.map((exp, expIndex) => {
              const showRole     = exp.role && exp.role.toLowerCase() !== "unknown";
              const allRoundsEmpty = exp.rounds.every((r) => !r.questions || r.questions.length === 0);

              return (
                <div
                  key={exp.id || expIndex}
                  className="border border-gray-100 rounded-xl p-4 md:p-5 mb-4 last:mb-0"
                >
                  {/* Meta row — wraps on mobile */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {showRole && (
                      <h3 className="font-semibold text-gray-900 text-sm">{exp.role}</h3>
                    )}
                    <span className="text-xs text-gray-400">{exp.year}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        difficultyStyles[exp.difficulty] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {exp.difficulty}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        outcomeStyles[exp.outcome] || outcomeStyles.unknown
                      }`}
                    >
                      {exp.outcome}
                    </span>

                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Trash2 size={13} />
                      {deletingId === exp.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  {exp.rounds.map((round, roundIndex) => {
                    if (!round.questions || round.questions.length === 0) return null;
                    return (
                      <div key={roundIndex} className="mb-3 last:mb-0">
                        <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                          {round.round_type} Round
                        </p>
                        <ul className="space-y-1.5 pl-4">
                          {round.questions.map((q, qIndex) => (
                            <li
                              key={qIndex}
                              className="text-sm text-gray-600 list-disc marker:text-orange-400 leading-snug"
                            >
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}

                  {allRoundsEmpty && (
                    <p className="text-sm text-gray-400 italic">
                      No questions extracted for this experience.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyDetail;