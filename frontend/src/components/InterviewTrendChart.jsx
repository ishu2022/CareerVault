export default function InterviewTrendChart({ data }) {
  const width = 320;
  const height = 170;
  const padding = 20;

  const max = Math.max(...data.map((d) => d.value));
  const stepX = (width - padding * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (d.value / max) * (height - padding * 1.6);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
    height - padding
  } Z`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold text-gray-900">Interview Trend</h3>
          <p className="text-xs text-gray-400">Interviews added over time</p>
        </div>
        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 bg-white">
          <option>Last 6 Months</option>
        </select>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full mt-3">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendFill)" />
        <path d={linePath} fill="none" stroke="#F97316" strokeWidth="2" />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="3.5" fill="#F97316" />
        ))}
      </svg>

      <div className="flex justify-between mt-1 text-[10px] text-gray-400 px-1">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}