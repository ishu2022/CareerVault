export default function RecentInterviews({ items }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">Recently Added Interviews</h3>
          <p className="text-xs text-gray-400">Latest interview experiences shared by the community</p>
        </div>
        <button type="button" className="text-orange-500 text-sm font-medium hover:underline whitespace-nowrap">
          View all →
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <div key={`${item.company}-${item.role}`} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${item.logoBg} ${item.logoText}`}
              >
                {item.initial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{item.company}</p>
                  <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-2 py-0.5">{item.year}</span>
                </div>
                <p className="text-xs text-gray-400">{item.role}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{item.timeAgo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}