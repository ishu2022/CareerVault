export default function PopularTopics({ topics }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full">
      <h3 className="font-semibold text-gray-900 mb-1">Popular Topics</h3>
      <p className="text-xs text-gray-400 mb-4">Most frequently asked topics in interviews</p>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <span
            key={t.name}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-700"
          >
            {t.name}
            <span className="text-gray-400">{t.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}