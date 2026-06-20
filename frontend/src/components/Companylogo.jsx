// CompanyLogo.jsx
//
// We don't have real logo images for every company yet, so this shows
// a colored square with the company's first letter instead - a common
// "avatar placeholder" pattern.
//
// name.charCodeAt(0) turns the first letter into a number (e.g. "A" -> 65).
// Using % colors.length (the remainder, same as Python's %) maps that
// number onto one of our 8 colors. Because a name's first letter never
// changes, the same company always gets the same color.

const colors = [
  "bg-gray-900 text-white",
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-red-600 text-white",
  "bg-purple-600 text-white",
  "bg-amber-500 text-white",
  "bg-sky-600 text-white",
  "bg-pink-600 text-white",
];

export default function CompanyLogo({ name, size = "w-12 h-12" }) {
  const initial = name.charAt(0).toUpperCase();
  const colorClass = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`${size} rounded-xl flex items-center justify-center text-lg font-bold ${colorClass}`}
    >
      {initial}
    </div>
  );
}