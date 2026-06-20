import React from "react";
import { Star, User } from "lucide-react";

const statusStyles = {
  Positive: "bg-green-50 text-green-600",
  Neutral: "bg-gray-100 text-gray-600",
  Negative: "bg-red-50 text-red-600",
};

const InterviewCard = ({
  month,
  year,
  role,
  status,
  roundsPath,
  tags,
  rating,
  timeAgo,
}) => {
  const visibleTags = tags.slice(0, 4);
  const extraCount = tags.length - visibleTags.length;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Month/Year box */}
      <div className="w-16 h-16 bg-orange-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-orange-600">{month}</span>
        <span className="text-xs text-orange-500">{year}</span>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">{role}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              statusStyles[status] || statusStyles.Neutral
            }`}
          >
            {status}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-2">
          {roundsPath.join(" → ")}
        </p>

        <div className="flex items-center gap-2">
          {visibleTags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
              +{extraCount}
            </span>
          )}
        </div>
      </div>

      {/* Right side: rating + time */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center justify-end gap-1 text-sm font-semibold text-gray-900">
          <Star size={14} className="text-orange-400 fill-orange-400" />
          {rating}<span className="text-gray-400 font-normal">/5</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
        <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
          <User size={12} />
          Anonymous
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;