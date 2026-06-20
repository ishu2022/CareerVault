import React from "react";

const OAStatCard = ({ icon, iconBg, title, value, subtitle, valueExtra }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value}
          {valueExtra && (
            <span className="text-sm font-normal text-gray-400 ml-1">
              {valueExtra}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export default OAStatCard;