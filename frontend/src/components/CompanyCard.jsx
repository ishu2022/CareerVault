export default function CompanyCard({ logo, name, interviews, onViewDetails }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3 shrink-0">
        {logo}
      </div>
      <p className="font-semibold text-gray-900 text-sm leading-snug break-words w-full">{name}</p>
      <p className="text-xs text-gray-400 mb-3 mt-0.5">
        {interviews !== null && interviews !== undefined
          ? `${interviews} Interviews`
          : "View interview experiences"}
      </p>
      <button
        type="button"
        onClick={onViewDetails}
        className="w-full text-center text-xs font-medium text-orange-600 border border-orange-200 rounded-lg py-1.5 hover:bg-orange-50 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}