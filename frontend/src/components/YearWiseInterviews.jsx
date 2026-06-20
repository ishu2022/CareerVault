import React from "react";

const YearWiseInterviews = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">
        Year-wise Interviews
      </h3>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.year} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10">{item.year}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-orange-400 rounded-full"
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-8 text-right">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearWiseInterviews;