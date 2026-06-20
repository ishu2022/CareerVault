import React from "react";

const RoundSection = ({ roundName, questions }) => {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">{roundName}</p>
      <ul className="space-y-1 pl-4">
        {questions.map((question, index) => (
          <li
            key={index}
            className="text-sm text-gray-600 list-disc marker:text-orange-400"
          >
            {question}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoundSection;