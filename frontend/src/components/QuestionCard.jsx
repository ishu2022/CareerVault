import React from "react";
import { Bookmark } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const QuestionCard = ({ id, company, question, topic, year }) => {
  const { toggleBookmark, isBookmarked } = useAppContext();
  const bookmarked = isBookmarked(id);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 font-bold text-gray-700 text-xs">
            {company.charAt(0)}
          </div>
          <span className="text-sm font-medium text-gray-700">{company}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-base mb-2">
          {question}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {topic}
          </span>
          {year && (
            <>
              <span>•</span>
              <span>Asked in {year}</span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleBookmark(id)}
        className={`w-9 h-9 flex items-center justify-center border rounded-lg transition-colors flex-shrink-0 ml-4 ${
          bookmarked
            ? "border-orange-300 text-orange-500 bg-orange-50"
            : "border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200"
        }`}
      >
        <Bookmark size={16} className={bookmarked ? "fill-orange-500" : ""} />
      </button>
    </div>
  );
};

export default QuestionCard;