import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle, SkipForward, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getCompany } from "../api/api";

const DURATIONS = [
  { label: "30 minutes", seconds: 30 * 60 },
  { label: "60 minutes", seconds: 60 * 60 },
];

const RATING = {
  CONFIDENT: "confident",
  STRUGGLED: "struggled",
  SKIPPED: "skipped",
};

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const MockTest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const company = searchParams.get("company") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [phase, setPhase] = useState("setup"); // setup | running | finished
  const [duration, setDuration] = useState(DURATIONS[0].seconds);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({}); // { questionIndex: "confident" | "struggled" | "skipped" }

  const intervalRef = useRef(null);

  // Fetch real questions for this company
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCompany(company);
        const allRounds = (data.experiences || []).flatMap((exp) => exp.rounds || []);
        const allQuestions = allRounds
          .flatMap((r) =>
            (r.questions || []).map((q) => ({ text: q, roundType: r.round_type }))
          )
          .filter((q) => q.text.trim());

        // Dedupe and cap at 15 questions for a reasonable mock test length
        const seen = new Set();
        const unique = allQuestions.filter((q) => {
          if (seen.has(q.text)) return false;
          seen.add(q.text);
          return true;
        });

        setQuestions(unique.slice(0, 15));
      } catch (err) {
        setError("Failed to load questions for this company.");
      } finally {
        setLoading(false);
      }
    };

    if (company) fetchData();
  }, [company]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "running") return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setPhase("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const startTest = () => {
    setTimeLeft(duration);
    setCurrentIndex(0);
    setRatings({});
    setPhase("running");
  };

  const rateQuestion = (rating) => {
    setRatings((prev) => ({ ...prev, [currentIndex]: rating }));
  };

  const goToQuestion = (index) => setCurrentIndex(index);

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const submitTest = () => {
    clearInterval(intervalRef.current);
    setPhase("finished");
  };

  // Score calculation
  const ratedEntries = Object.values(ratings);
  const confidentCount = ratedEntries.filter((r) => r === RATING.CONFIDENT).length;
  const struggledCount = ratedEntries.filter((r) => r === RATING.STRUGGLED).length;
  const skippedCount = ratedEntries.filter((r) => r === RATING.SKIPPED).length;
  const unratedCount = questions.length - ratedEntries.length;
  const scorePercent =
    questions.length > 0 ? Math.round((confidentCount / questions.length) * 100) : 0;
  const timeTaken = duration - timeLeft;

  const navColorFor = (index) => {
    const r = ratings[index];
    if (r === RATING.CONFIDENT) return "bg-green-500 text-white";
    if (r === RATING.STRUGGLED) return "bg-yellow-400 text-white";
    if (r === RATING.SKIPPED) return "bg-gray-300 text-gray-600";
    if (index === currentIndex) return "bg-orange-500 text-white";
    return "bg-white border border-gray-200 text-gray-600";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="OA Prep" />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <button
            onClick={() => navigate("/oa-prep")}
            className="flex items-center gap-2 text-sm text-orange-600 font-medium mb-5 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to OA Prep
          </button>

          {loading && <p className="text-gray-500 text-sm">Loading questions...</p>}
          {!loading && error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && questions.length === 0 && (
            <p className="text-gray-500 text-sm">
              No questions available for {company} to build a mock test.
            </p>
          )}

          {/* SETUP PHASE */}
          {!loading && !error && questions.length > 0 && phase === "setup" && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 max-w-lg shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mock Test — {company}
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                {questions.length} real interview questions loaded. Choose your time limit to begin.
              </p>

              <div className="space-y-3 mb-6">
                {DURATIONS.map((d) => (
                  <button
                    key={d.seconds}
                    onClick={() => setDuration(d.seconds)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      duration === d.seconds
                        ? "border-orange-500 bg-orange-50 text-orange-600 font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <button
                onClick={startTest}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Start Test
              </button>
            </div>
          )}

          {/* RUNNING PHASE */}
          {phase === "running" && questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Timer bar */}
                <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Clock size={18} className="text-orange-500" />
                    {formatTime(timeLeft)}
                  </div>
                  <span className="text-sm text-gray-400">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                {/* Question card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                  {questions[currentIndex].roundType && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize mb-3 inline-block">
                      {questions[currentIndex].roundType} Round
                    </span>
                  )}
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    {questions[currentIndex].text}
                  </p>
                </div>

                {/* Self-rate buttons */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-3">How did it go?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => rateQuestion(RATING.CONFIDENT)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        ratings[currentIndex] === RATING.CONFIDENT
                          ? "bg-green-500 text-white border-green-500"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      Confident
                    </button>
                    <button
                      onClick={() => rateQuestion(RATING.STRUGGLED)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        ratings[currentIndex] === RATING.STRUGGLED
                          ? "bg-yellow-400 text-white border-yellow-400"
                          : "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                      }`}
                    >
                      <AlertCircle size={16} />
                      Struggled
                    </button>
                    <button
                      onClick={() => rateQuestion(RATING.SKIPPED)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        ratings[currentIndex] === RATING.SKIPPED
                          ? "bg-gray-400 text-white border-gray-400"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <SkipForward size={16} />
                      Skip
                    </button>
                  </div>
                </div>

                {/* Nav buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {currentIndex === questions.length - 1 ? (
                    <button
                      onClick={submitTest}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                    >
                      Submit Test
                    </button>
                  ) : (
                    <button
                      onClick={goNext}
                      className="px-5 py-2.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>

              {/* Question navigator */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-fit">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">
                  Question Navigator
                </h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${navColorFor(index)}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500" /> Confident
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-yellow-400" /> Struggled
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-gray-300" /> Skipped
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded border border-gray-200 bg-white" /> Not yet rated
                  </div>
                </div>

                <button
                  onClick={submitTest}
                  className="w-full mt-4 text-sm font-medium text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors"
                >
                  End Test Early
                </button>
              </div>
            </div>
          )}

          {/* FINISHED PHASE */}
          {phase === "finished" && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 max-w-2xl shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Test Complete</h1>
              <p className="text-gray-500 text-sm mb-6">
                Here's how your {company} mock test went.
              </p>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-28 h-28 rounded-full border-8 border-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-orange-500">{scorePercent}%</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Score is based on how many questions you felt confident about.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Time taken: {formatTime(timeTaken)} of {formatTime(duration)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-xl font-bold text-green-600">{confidentCount}</p>
                  <p className="text-xs text-gray-500">Confident</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <p className="text-xl font-bold text-yellow-600">{struggledCount}</p>
                  <p className="text-xs text-gray-500">Struggled</p>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-xl">
                  <p className="text-xl font-bold text-gray-600">{skippedCount}</p>
                  <p className="text-xs text-gray-500">Skipped</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-gray-400">{unratedCount}</p>
                  <p className="text-xs text-gray-500">Not Rated</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startTest}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Retake Test
                </button>
                <button
                  onClick={() => navigate("/oa-prep")}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to OA Prep
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MockTest;