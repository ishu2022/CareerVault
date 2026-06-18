export default function StatCard({ title, value }) {
  return (
    <div style={s.card}>
      <div style={s.value}>{value ?? "—"}</div>
      <div style={s.title}>{title}</div>
    </div>
  );
}

const s = {
  card: {
    background:   "var(--code-bg, #f4f3ec)",
    border:       "1px solid var(--border, #e5e4e7)",
    borderRadius: "10px",
    padding:      "24px",
    textAlign:    "left",
  },
  value: {
    fontSize:     "36px",
    fontWeight:   700,
    lineHeight:   1,
    color:        "var(--accent, #aa3bff)",
    marginBottom: "8px",
  },
  title: {
    fontSize: "13px",
    color:    "var(--text, #6b6375)",
  },
};