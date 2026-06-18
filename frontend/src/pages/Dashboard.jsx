import { useState, useEffect } from "react";
import { getStats } from "../api/services";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <h1 style={s.title}>Dashboard</h1>
      <p style={s.sub}>CareerVault interview intelligence</p>

      {loading && <p style={s.state}>Loading…</p>}

      {error && (
        <div style={s.error}>
          <strong>Could not load stats</strong> — {error}
        </div>
      )}

      {stats && (
        <div style={s.grid}>
          <StatCard title="Companies"   value={stats.total_companies}  />
          <StatCard title="Interviews"  value={stats.total_interviews} />
          <StatCard title="Questions"   value={stats.total_questions}  />
          <StatCard title="Rounds"      value={stats.total_rounds}     />
        </div>
      )}
    </div>
  );
}

const s = {
  page:  { maxWidth: "860px", margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: "24px", fontWeight: 700, color: "var(--text-h)", margin: "0 0 6px" },
  sub:   { fontSize: "14px", color: "var(--text)", margin: "0 0 32px" },
  state: { color: "var(--text)", padding: "48px 0", textAlign: "center" },
  error: {
    padding:      "12px 16px",
    borderRadius: "8px",
    border:       "1px solid var(--accent-border, rgba(170,59,255,0.5))",
    background:   "var(--accent-bg, rgba(170,59,255,0.1))",
    color:        "var(--accent, #aa3bff)",
    fontSize:     "14px",
    marginBottom: "24px",
  },
  grid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap:                 "14px",
  },
};