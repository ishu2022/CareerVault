import React from "react";

const PrepTipCard = ({ icon, iconBg, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center px-3">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${iconBg}`}
      >
        {icon}
      </div>
      <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default PrepTipCard;