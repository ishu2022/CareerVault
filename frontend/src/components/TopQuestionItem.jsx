import React from "react";
import { Bookmark } from "lucide-react";

const TopQuestionItem = ({ rank, question, topic }) => {
  return (
    <div className="flex items-center justify-between border border-gray-100 rounded-xl p-4 mb-3 last:mb-0 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 font-semibold text-sm flex items-center justify-center flex-shrink-0">
          {rank}
        </span>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{question}</p>
          <p className="text-xs text-gray-400 mt-0.5">{topic}</p>
        </div>
      </div>

      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors flex-shrink-0"
      >
        <Bookmark size={14} />
      </button>
    </div>
  );
};

export default TopQuestionItem;