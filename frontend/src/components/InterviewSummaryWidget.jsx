import React from "react";
import { FileText, Star, Clock, BarChart2 } from "lucide-react";

const InterviewSummaryWidget = ({
  totalInterviews,
  avgRating,
  avgProcessTime,
  difficultyLevel,
}) => {
  const stats = [
    { icon: FileText, value: totalInterviews, label: "Total Interviews" },
    { icon: Star, value: avgRating, label: "Average Rating" },
    { icon: Clock, value: avgProcessTime, label: "Avg Process Time" },
    { icon: BarChart2, value: difficultyLevel, label: "Difficulty Level" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">
          Interview Summary
        </h3>
        <BarChart2 size={16} className="text-orange-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="border border-gray-100 rounded-lg p-3"
            >
              <Icon size={16} className="text-orange-400 mb-2" />
              <p className="text-base font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewSummaryWidget;