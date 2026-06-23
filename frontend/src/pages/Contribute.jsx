import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Rocket, Plus, Trash2, CheckCircle, AlertCircle, FileText, Award } from "lucide-react";
import { submitExperience } from "../api/api";

const emptyRound = () => ({ round_type: "technical", questions: [""], tips: [""] });

const roundTypeStyles = {
  technical: "bg-blue-50 text-blue-600 border-blue-200",
  hr: "bg-pink-50 text-pink-600 border-pink-200",
  managerial: "bg-purple-50 text-purple-600 border-purple-200",
};

export default function Contribute() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [year, setYear] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [outcome, setOutcome] = useState("unknown");
  const [rounds, setRounds] = useState([emptyRound()]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateRound = (index, field, value) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const updateQuestion = (roundIndex, qIndex, value) => {
    setRounds((prev) =>
      prev.map((r, i) => {
        if (i !== roundIndex) return r;
        const questions = [...r.questions];
        questions[qIndex] = value;
        return { ...r, questions };
      })
    );
  };

  const addQuestion = (roundIndex) => {
    setRounds((prev) =>
      prev.map((r, i) =>
        i === roundIndex ? { ...r, questions: [...r.questions, ""] } : r
      )
    );
  };

  const removeQuestion = (roundIndex, qIndex) => {
    setRounds((prev) =>
      prev.map((r, i) => {
        if (i !== roundIndex) return r;
        return { ...r, questions: r.questions.filter((_, qi) => qi !== qIndex) };
      })
    );
  };

  const addRound = () => setRounds((prev) => [...prev, emptyRound()]);

  const removeRound = (index) =>
    setRounds((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!company.trim()) {
      setError("Company name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const payload = {
      company: company.trim(),
      role: role.trim(),
      year: year.trim(),
      difficulty,
      outcome,
      rounds: rounds.map((r) => ({
        round_type: r.round_type,
        questions: r.questions.filter((q) => q.trim()),
        tips: r.tips.filter((t) => t.trim()),
      })),
    };

    try {
      await submitExperience(payload);
      setSuccess(true);
      setCompany("");
      setRole("");
      setYear("");
      setDifficulty("medium");
      setOutcome("unknown");
      setRounds([emptyRound()]);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuestions = rounds.reduce(
    (sum, r) => sum + r.questions.filter((q) => q.trim()).length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeItem="Contribute" />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Rocket className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contribute</h1>
              <p className="text-gray-500 mt-0.5">
                Share your interview experience and help others prepare better.
              </p>
            </div>
          </div>

          {/* Status banners */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
              <CheckCircle size={16} className="flex-shrink-0" />
              Experience submitted successfully. Thank you for contributing!
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-5">
            <div className="flex items-center gap-2 mb-5">
              <Award size={16} className="text-orange-500" />
              <h2 className="text-base font-bold text-gray-900">
                Interview Details
              </h2>
            </div>

            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Amazon, Google, TCS"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. SDE Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Outcome
                </label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                >
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Rounds */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-orange-500" />
                <h2 className="text-base font-bold text-gray-900">
                  Interview Rounds
                </h2>
              </div>
              {totalQuestions > 0 && (
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                  {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} added
                </span>
              )}
            </div>

            <div className="space-y-4">
              {rounds.map((round, rIndex) => (
                <div
                  key={rIndex}
                  className="border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <select
                      value={round.round_type}
                      onChange={(e) =>
                        updateRound(rIndex, "round_type", e.target.value)
                      }
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg border capitalize ${
                        roundTypeStyles[round.round_type] || roundTypeStyles.technical
                      }`}
                    >
                      <option value="technical">Technical</option>
                      <option value="hr">HR</option>
                      <option value="managerial">Managerial</option>
                    </select>

                    {rounds.length > 1 && (
                      <button
                        onClick={() => removeRound(rIndex)}
                        className="text-red-500 text-xs font-medium flex items-center gap-1 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                        Remove Round
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    {round.questions.map((q, qIndex) => (
                      <div key={qIndex} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 w-5 flex-shrink-0">
                          {qIndex + 1}.
                        </span>
                        <input
                          type="text"
                          placeholder="Type the question asked..."
                          value={q}
                          onChange={(e) =>
                            updateQuestion(rIndex, qIndex, e.target.value)
                          }
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                        />
                        {round.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(rIndex, qIndex)}
                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addQuestion(rIndex)}
                    className="text-orange-600 text-xs font-medium flex items-center gap-1 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={13} />
                    Add Question
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addRound}
              className="w-full mt-4 text-sm font-medium text-orange-600 border border-dashed border-orange-300 rounded-xl py-3 hover:bg-orange-50 transition-colors"
            >
              + Add Another Round
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Your contribution helps others prepare smarter. Thank you!
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold px-7 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              {submitting ? "Submitting..." : "Submit Experience"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}