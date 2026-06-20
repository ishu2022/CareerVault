import React from "react";

const TopicProgressBar = ({ icon, iconBg, label, percentage }) => {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <span className="font-medium text-gray-800 text-sm flex-1">
          {label}
        </span>
        <span className="font-semibold text-gray-900 text-sm">
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-12">
        <div
          className="h-2 bg-orange-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default TopicProgressBar;