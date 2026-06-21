import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Rocket, Plus, Trash2, CheckCircle } from "lucide-react";
import { submitExperience } from "../api/api";

const emptyRound = () => ({ round_type: "technical", questions: [""], tips: [""] });

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

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeItem="Contribute" />

      <div className="flex-1 p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contribute</h1>
            <p className="text-gray-500">
              Share your interview experience and help others.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">
            Submit Interview Experience
          </h2>

          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
              <CheckCircle size={16} />
              Experience submitted successfully. Thank you for contributing!
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Company Name *"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 mb-4"
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
            />
            <input
              type="text"
              placeholder="Year (e.g. 2025)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-gray-700"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-gray-700"
            >
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Rounds */}
          <div className="space-y-4 mb-6">
            {rounds.map((round, rIndex) => (
              <div
                key={rIndex}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={round.round_type}
                    onChange={(e) =>
                      updateRound(rIndex, "round_type", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2 text-sm text-gray-700"
                  >
                    <option value="technical">Technical</option>
                    <option value="hr">HR</option>
                    <option value="managerial">Managerial</option>
                  </select>

                  {rounds.length > 1 && (
                    <button
                      onClick={() => removeRound(rIndex)}
                      className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                    >
                      <Trash2 size={14} />
                      Remove Round
                    </button>
                  )}
                </div>

                {round.questions.map((q, qIndex) => (
                  <div key={qIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Question ${qIndex + 1}`}
                      value={q}
                      onChange={(e) =>
                        updateQuestion(rIndex, qIndex, e.target.value)
                      }
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    {round.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(rIndex, qIndex)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addQuestion(rIndex)}
                  className="text-orange-600 text-sm flex items-center gap-1 hover:underline mt-1"
                >
                  <Plus size={14} />
                  Add Question
                </button>
              </div>
            ))}

            <button
              onClick={addRound}
              className="text-sm font-medium text-orange-600 border border-orange-200 rounded-lg px-4 py-2 hover:bg-orange-50 transition-colors"
            >
              + Add Another Round
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}