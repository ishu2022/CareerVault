export default function StatsCard({ icon: Icon, iconBg, iconColor, label, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
        </div>
        <p className="text-sm text-gray-500 leading-snug">{label}</p>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}