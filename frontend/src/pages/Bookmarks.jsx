import React from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import QuestionCard from "../components/QuestionCard";
import { useAppContext } from "../context/AppContext";
import { questions } from "../data/questions";

const Bookmarks = () => {
  const { bookmarks } = useAppContext();
  const navigate = useNavigate();

  const bookmarkedQuestions = questions.filter((q) =>
    bookmarks.includes(q.id)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
            <p className="text-gray-500 mt-1">
              Questions you've saved for later review
            </p>
          </div>

          <div className="space-y-4">
            {bookmarkedQuestions.length > 0 ? (
              bookmarkedQuestions.map((item) => (
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
              <div className="text-center py-16">
                <Bookmark size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  You haven't bookmarked any questions yet.
                </p>
                <button
                  onClick={() => navigate("/questions")}
                  className="text-sm font-medium text-orange-600 border border-orange-200 rounded-lg px-4 py-2 hover:bg-orange-50 transition-colors"
                >
                  Browse Questions →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bookmarks;