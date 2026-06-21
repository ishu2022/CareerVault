export default function CompanyMark({ name, bg, fg, letter }) {
  const safeName = name || "?";

  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[#EAEAEA]"
      style={{ backgroundColor: bg }}
    >
      <span className="text-lg font-bold" style={{ color: fg }}>
        {letter || safeName.charAt(0)}
      </span>
    </div>
  );
}
